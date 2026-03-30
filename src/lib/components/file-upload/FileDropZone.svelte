<!--
	FileDropZone.svelte

	A drag-and-drop file upload component with preview, validation, and upload state management.

	Note: All file type and size validation is client-side only.
	Always validate files on the server before processing.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import { onDestroy } from 'svelte';

	import { cn } from '$lib/utils';
	import { Upload, X, Image, Video, Music, FileText, File as FileIcon, CircleAlert } from '@lucide/svelte';
	import { useId } from 'bits-ui';

	import type { FileDropZoneProps, FileRejectedReason } from './types';

	import { displaySize, formatAcceptDisplay } from './utils';

	let {
		id = useId(),
		ref = $bindable(null),
		maxFiles,
		maxFileSize,
		disabled = false,
		onUpload,
		onChange,
		onFileRejected,
		onFileRemoved,
		onError,
		accept,
		class: className,
		containerClass = '',
		variant = 'default',
		showPreview = true,
		...rest
	}: FileDropZoneProps = $props();

	let uploading = $state(false);
	let dragOver = $state(false);
	let uploadedFiles = $state<Array<{ file: File; id: string; preview?: string; uploading?: boolean; error?: boolean }>>([]);

	// Clamp maxFiles to >= 1 when provided, guards against maxFiles=0 edge case
	const effectiveMaxFiles = $derived(maxFiles !== undefined ? Math.max(1, maxFiles) : undefined);
	const maxFilesReached = $derived(effectiveMaxFiles !== undefined && uploadedFiles.length >= effectiveMaxFiles);
	const canUploadFiles = $derived(!disabled && !uploading && !maxFilesReached);

	const statusMessage = $derived.by(() => {
		if (uploading) {
			const count = uploadedFiles.filter((f) => f.uploading).length;
			return `Processing ${count} file${count > 1 ? 's' : ''}`;
		}
		if (uploadedFiles.some((f) => f.error)) {
			const count = uploadedFiles.filter((f) => f.error).length;
			return `${count} file upload${count > 1 ? 's' : ''} failed`;
		}
		if (uploadedFiles.length > 0) return `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} selected`;
		return '';
	});

	const getFileIcon = (file: File): Component => {
		if (file.type.startsWith('image/')) return Image;
		if (file.type.startsWith('video/')) return Video;
		if (file.type.startsWith('audio/')) return Music;
		if (file.type.includes('text') || file.type.includes('document')) return FileText;
		return FileIcon;
	};

	const createPreview = (file: File): string | undefined => {
		if (!file.type.startsWith('image/')) return undefined;
		return URL.createObjectURL(file);
	};

	const revokePreview = (preview?: string) => {
		if (preview) URL.revokeObjectURL(preview);
	};

	const removeFile = (fileId: string) => {
		const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
		if (fileToRemove) {
			revokePreview(fileToRemove.preview);
			onFileRemoved?.(fileToRemove.file);
		}
		uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);
		onChange?.(uploadedFiles.map((f) => f.file));
	};

	const drop = async (e: DragEvent & { currentTarget: EventTarget & HTMLLabelElement }) => {
		if (disabled || !canUploadFiles) return;

		e.preventDefault();
		dragOver = false;

		const droppedFiles = Array.from(e.dataTransfer?.files ?? []);
		await upload(droppedFiles);
	};

	const change = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		if (!canUploadFiles) return;

		const selectedFiles = e.currentTarget.files;
		if (!selectedFiles) return;

		await upload(Array.from(selectedFiles));
		(e.target as HTMLInputElement).value = '';
	};

	const shouldAcceptFile = (file: File, proposedCount: number): FileRejectedReason | undefined => {
		if (maxFileSize !== undefined && file.size > maxFileSize) return 'Maximum file size exceeded';
		if (effectiveMaxFiles !== undefined && proposedCount > effectiveMaxFiles) return 'Maximum files uploaded';
		if (!accept) return undefined;

		const acceptedTypes = accept.split(',').map((a) => a.trim().toLowerCase());
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			if (pattern.startsWith('.')) {
				return fileName.endsWith(pattern);
			}
			if (pattern.endsWith('/*')) {
				const baseType = pattern.slice(0, pattern.indexOf('/*'));
				return fileType.startsWith(baseType + '/');
			}
			return fileType === pattern;
		});

		if (!isAcceptable) return 'File type not allowed';
		return undefined;
	};

	const buildFileItems = (uploadFiles: File[]) => {
		const validFiles: File[] = [];
		const fileItems: Array<{ file: File; id: string; preview?: string; uploading: boolean; error: boolean }> = [];

		for (const file of uploadFiles) {
			const rejectedReason = shouldAcceptFile(file, uploadedFiles.length + validFiles.length + 1);

			if (rejectedReason) {
				onFileRejected?.({ file, reason: rejectedReason });
				continue;
			}

			validFiles.push(file);
			fileItems.push({
				file,
				id: crypto.randomUUID(),
				preview: createPreview(file),
				uploading: !!onUpload,
				error: false
			});
		}

		return { validFiles, fileItems };
	};

	const upload = async (uploadFiles: File[]) => {
		if (uploading) return;
		uploading = true;

		try {
			const { validFiles, fileItems } = buildFileItems(uploadFiles);

			if (fileItems.length > 0) {
				uploadedFiles = [...uploadedFiles, ...fileItems];
				onChange?.(uploadedFiles.map((f) => f.file));
			}

			if (validFiles.length > 0 && onUpload) {
				try {
					await onUpload(validFiles);

					uploadedFiles = uploadedFiles.map((item) => (fileItems.some((u) => u.id === item.id) ? { ...item, uploading: false } : item));
				} catch (error) {
					uploadedFiles = uploadedFiles.map((item) => {
						if (fileItems.some((u) => u.id === item.id)) {
							revokePreview(item.preview);
							return { ...item, uploading: false, error: true, preview: undefined };
						}
						return item;
					});
					onError?.(error);
				}
			}
		} finally {
			uploading = false;
		}
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		if (!canUploadFiles) return;
		dragOver = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		const relatedTarget = e.relatedTarget as Node | null;
		if (!target?.contains(relatedTarget)) {
			dragOver = false;
		}
	};

	const handleDragEnd = () => {
		dragOver = false;
	};

	// Variant styles
	const variantStyles = {
		default: 'border-input hover:border-primary/50',
		primary: 'border-primary/30 hover:border-primary',
		secondary: 'border-secondary/30 hover:border-secondary'
	};

	const variantDragStyles = {
		default: 'border-primary bg-primary/5',
		primary: 'border-primary bg-primary/10',
		secondary: 'border-secondary bg-secondary/10'
	};

	const variantTextStyles = {
		default: 'text-primary',
		primary: 'text-primary',
		secondary: 'text-secondary'
	};

	/** Clear all files and revoke previews. Can be called from parent via bind:this. */
	export function clearFiles() {
		for (const item of uploadedFiles) {
			revokePreview(item.preview);
		}
		uploadedFiles = [];
		onChange?.([]);
	}

	// Cleanup object URLs on component destroy to prevent memory leaks
	onDestroy(() => {
		for (const item of uploadedFiles) {
			revokePreview(item.preview);
		}
	});
</script>

<div class={cn('flex w-full flex-col', className)}>
	<div
		class={cn(
			'flex h-full w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed transition-colors',
			dragOver && canUploadFiles ? variantDragStyles[variant] : variantStyles[variant],
			!canUploadFiles && 'cursor-not-allowed opacity-50',
			containerClass
		)}
	>
		<!-- Main Drop Zone -->
		<label
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondragend={handleDragEnd}
			ondrop={drop}
			for={id}
			class={cn(
				'w-full cursor-pointer',
				!canUploadFiles && 'cursor-not-allowed',
				'has-focus-visible:rounded-lg has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2'
			)}
		>
			<div class="flex-col items-center">
				<div class="flex justify-between gap-2 px-3 py-2">
					<!-- File Constraints -->
					{#if effectiveMaxFiles || maxFileSize}
						<div class="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
							{#if effectiveMaxFiles && maxFileSize}
								Max: {effectiveMaxFiles}
								{effectiveMaxFiles > 1 ? 'files' : 'file'} ({displaySize(maxFileSize)}
								{effectiveMaxFiles > 1 ? 'each' : ''})
							{:else if effectiveMaxFiles}
								Max: {effectiveMaxFiles}
								{effectiveMaxFiles > 1 ? 'files' : 'file'}
							{:else if maxFileSize}
								Max: {displaySize(maxFileSize)}
							{/if}
						</div>
					{/if}

					<!-- File Types -->
					{#if accept}
						<div class="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
							{formatAcceptDisplay(accept)}
						</div>
					{/if}
				</div>
				{#if !maxFilesReached}
					<div
						class={cn(
							'flex items-center justify-center gap-2 p-6',
							dragOver && canUploadFiles ? variantTextStyles[variant] : 'text-muted-foreground',
							!canUploadFiles && 'opacity-50'
						)}
					>
						<!-- Upload Icon -->
						<Upload class="h-5 w-5" />
						<span class="text-sm font-medium">
							{#if uploading}
								Processing files...
							{:else if uploadedFiles.length > 0}
								Add more files
							{:else}
								Drag & drop files here or Browse
							{/if}
						</span>
					</div>
				{/if}
			</div>
		</label>

		<!-- File Input -->
		<input
			{...rest}
			bind:this={ref}
			disabled={!canUploadFiles}
			{id}
			{accept}
			multiple={effectiveMaxFiles === undefined || effectiveMaxFiles - uploadedFiles.length > 1}
			type="file"
			onchange={change}
			class="sr-only"
		/>

		<!-- File Preview List -->
		{#if showPreview && uploadedFiles.length > 0}
			<div class="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-y-auto p-2" role="list" aria-label="Uploaded files">
				{#each uploadedFiles as fileItem (fileItem.id)}
					<div
						role="listitem"
						class={cn(
							'group relative flex items-center justify-between gap-3 rounded-md border bg-background p-2 transition-colors hover:bg-accent',
							fileItem.error ? 'border-destructive' : 'border-border'
						)}
					>
						<!-- Loader Overlay -->
						{#if fileItem.uploading}
							<div
								class="absolute inset-0 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm"
								role="status"
								aria-label="Uploading {fileItem.file.name}"
							>
								<div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
							</div>
						{/if}

						<div class="flex min-w-0 flex-1 items-center gap-3">
							<!-- File Icon/Preview -->
							{#if fileItem.preview}
								<img src={fileItem.preview} alt={fileItem.file.name} class="h-10 w-10 rounded object-cover" />
							{:else}
								{@const IconComponent = getFileIcon(fileItem.file)}
								<div class="flex h-10 w-10 items-center justify-center rounded bg-muted">
									<IconComponent class="h-5 w-5 text-muted-foreground" />
								</div>
							{/if}
							<!-- File Info -->
							<div class="min-w-0 flex-1">
								<div class="truncate text-sm font-medium text-foreground" title={fileItem.file.name}>
									{fileItem.file.name}
								</div>
								<div class={cn('text-xs', fileItem.error ? 'text-destructive' : 'text-muted-foreground')}>
									{#if fileItem.error}
										Upload failed &mdash; {displaySize(fileItem.file.size)}
									{:else}
										{displaySize(fileItem.file.size)}
									{/if}
								</div>
							</div>
						</div>

						<!-- Error Icon -->
						{#if fileItem.error}
							<CircleAlert class="h-4 w-4 shrink-0 text-destructive" />
						{/if}

						<!-- Remove Button -->
						<button
							type="button"
							onclick={() => removeFile(fileItem.id)}
							class={cn(
								'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
								'hover:bg-accent hover:text-accent-foreground',
								'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
								'disabled:pointer-events-none disabled:opacity-50'
							)}
							aria-label="Remove {fileItem.file.name}"
							disabled={fileItem.uploading}
						>
							<X class="h-4 w-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Screen reader status announcements -->
	<div aria-live="polite" class="sr-only">
		{statusMessage}
	</div>
</div>
