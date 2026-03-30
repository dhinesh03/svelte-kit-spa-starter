<script lang="ts">
	import { toast } from 'svelte-sonner';

	import type { UploadProgressEvent } from '$lib/services/fetch-service';

	import { uploadFile } from '$lib/apis/httpbin';
	import { FileDropZone, ACCEPT_IMAGE, MAX_FILE_SIZE_5MB, MAX_FILE_SIZE_10MB, displaySize } from '$lib/components/file-upload';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	// ── Upload with Progress ────────────────────────────────────────────

	interface FileUploadEntry {
		id: string;
		file: File;
		progress: number;
		status: 'pending' | 'uploading' | 'complete' | 'error';
		error?: string;
	}

	let uploadEntries = $state<FileUploadEntry[]>([]);
	let isUploading = $state(false);
	let progressDropZone = $state<FileDropZone | undefined>(undefined);
	let activeCancels = $state<Array<() => void>>([]);

	function handleProgressFilesChange(files: File[]) {
		uploadEntries = files.map((file) => {
			const existing = uploadEntries.find((e) => e.file === file);
			if (existing) return existing;
			return {
				id: crypto.randomUUID(),
				file,
				progress: 0,
				status: 'pending' as const
			};
		});
	}

	async function startUpload() {
		const pending = uploadEntries.filter((e) => e.status === 'pending' || e.status === 'error');
		if (pending.length === 0) return;

		isUploading = true;
		activeCancels = [];

		for (const entry of pending) {
			uploadEntries = uploadEntries.map((e) => (e.id === entry.id ? { ...e, status: 'uploading' as const, progress: 0 } : e));

			const onProgress = (progress: UploadProgressEvent) => {
				uploadEntries = uploadEntries.map((e) => (e.id === entry.id ? { ...e, progress: progress.percentage } : e));
			};

			const { request, cancel } = uploadFile(entry.file, onProgress);
			activeCancels = [...activeCancels, cancel];

			try {
				await request;
				uploadEntries = uploadEntries.map((e) => (e.id === entry.id ? { ...e, status: 'complete' as const, progress: 100 } : e));
				toast.success(`Uploaded ${entry.file.name}`);
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') {
					uploadEntries = uploadEntries.map((e) => (e.id === entry.id ? { ...e, status: 'error' as const, error: 'Upload cancelled' } : e));
				} else {
					uploadEntries = uploadEntries.map((e) =>
						e.id === entry.id ? { ...e, status: 'error' as const, error: err instanceof Error ? err.message : 'Upload failed' } : e
					);
					toast.error(`Failed to upload ${entry.file.name}`);
				}
			}
		}

		activeCancels = [];
		isUploading = false;
	}

	function clearUploads() {
		for (const cancel of activeCancels) cancel();
		activeCancels = [];
		uploadEntries = [];
		progressDropZone?.clearFiles();
	}

	const hasFiles = $derived(uploadEntries.length > 0);
	const hasPending = $derived(uploadEntries.some((e) => e.status === 'pending' || e.status === 'error'));

	// ── Basic examples ──────────────────────────────────────────────────

	function handleFileRejected(opts: { reason: string; file: File }) {
		toast.error(`${opts.file.name}: ${opts.reason}`);
	}
</script>

<div class="mx-auto max-w-4xl space-y-12 overflow-y-auto p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">File Upload</h1>
		<p class="mt-2 text-muted-foreground">
			Drag-and-drop file upload with validation, preview, and upload progress tracking via httpbin.org.
		</p>
	</div>

	<!-- Upload with Progress -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">Upload with Progress</h2>
		<p class="text-muted-foreground">Select files, then click Upload to send them to httpbin.org with real-time progress tracking.</p>

		<Card.Root>
			<Card.Header>
				<Card.Title>File Upload</Card.Title>
				<Card.Description>Files are uploaded sequentially to httpbin.org/post with XHR progress tracking.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<FileDropZone
					bind:this={progressDropZone}
					maxFiles={5}
					maxFileSize={MAX_FILE_SIZE_10MB}
					onChange={handleProgressFilesChange}
					onFileRejected={handleFileRejected}
					showPreview={false}
				/>

				<!-- Progress List -->
				{#if uploadEntries.length > 0}
					<div class="space-y-3">
						{#each uploadEntries as entry (entry.id)}
							<div class="space-y-1.5">
								<div class="flex items-center justify-between text-sm">
									<span class="truncate font-medium">{entry.file.name}</span>
									<span class="ml-2 shrink-0 text-muted-foreground">
										{#if entry.status === 'complete'}
											{displaySize(entry.file.size)}
										{:else if entry.status === 'uploading'}
											{entry.progress}%
										{:else if entry.status === 'error'}
											<span class="text-destructive">{entry.error}</span>
										{:else}
											{displaySize(entry.file.size)}
										{/if}
									</span>
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
									<div
										class="h-full rounded-full transition-all duration-300 {entry.status === 'error'
											? 'bg-destructive'
											: entry.status === 'complete'
												? 'bg-green-500'
												: 'bg-primary'}"
										style="width: {entry.status === 'pending' ? 0 : entry.progress}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<div class="flex gap-2">
					<Button onclick={startUpload} disabled={!hasPending || isUploading}>
						{#if isUploading}
							Uploading...
						{:else}
							Upload
						{/if}
					</Button>
					{#if hasFiles}
						<Button variant="outline" onclick={clearUploads} disabled={isUploading}>Clear</Button>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Configuration Examples -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold tracking-tight">Configuration Examples</h2>
		<p class="text-muted-foreground">Different FileDropZone configurations for common use cases.</p>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Images Only -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Images Only</Card.Title>
					<Card.Description>Accept only image files with 5 MB limit.</Card.Description>
				</Card.Header>
				<Card.Content>
					<FileDropZone accept={ACCEPT_IMAGE} maxFileSize={MAX_FILE_SIZE_5MB} maxFiles={3} onFileRejected={handleFileRejected} />
				</Card.Content>
			</Card.Root>

			<!-- Single File -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Single File</Card.Title>
					<Card.Description>Limit to a single file upload.</Card.Description>
				</Card.Header>
				<Card.Content>
					<FileDropZone maxFiles={1} maxFileSize={MAX_FILE_SIZE_10MB} onFileRejected={handleFileRejected} />
				</Card.Content>
			</Card.Root>

			<!-- Primary Variant -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Primary Variant</Card.Title>
					<Card.Description>Using the primary visual style.</Card.Description>
				</Card.Header>
				<Card.Content>
					<FileDropZone variant="primary" maxFiles={3} onFileRejected={handleFileRejected} />
				</Card.Content>
			</Card.Root>

			<!-- Secondary Variant -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Secondary Variant</Card.Title>
					<Card.Description>Using the secondary visual style.</Card.Description>
				</Card.Header>
				<Card.Content>
					<FileDropZone variant="secondary" maxFiles={3} onFileRejected={handleFileRejected} />
				</Card.Content>
			</Card.Root>
		</div>
	</section>
</div>
