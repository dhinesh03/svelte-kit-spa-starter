import type { HTMLInputAttributes } from 'svelte/elements';

import type { WithoutChildren } from 'bits-ui';

export type FileRejectedReason = 'Maximum file size exceeded' | 'File type not allowed' | 'Maximum files uploaded';

export type FileDropZoneVariant = 'default' | 'primary' | 'secondary';

export type FileDropZonePropsWithoutHTML = WithoutChildren<{
	ref?: HTMLInputElement | null;
	/** Called with the selected files when the user drops or clicks and selects their files. */
	onUpload?: (files: File[]) => Promise<void>;
	/** Called when files are selected/dropped, passes the file list to parent component. */
	onChange?: (files: File[]) => void;
	/** The maximum number of files allowed to be uploaded. Must be >= 1. */
	maxFiles?: number;

	/** The maximum size of a file in bytes */
	maxFileSize?: number;
	/** Called when a file does not meet the upload criteria (size, or type) */
	onFileRejected?: (opts: { reason: FileRejectedReason; file: File }) => void;
	/** Called when a file is removed from the preview list */
	onFileRemoved?: (file: File) => void;
	/** Called when onUpload throws an error */
	onError?: (error: unknown) => void;

	/** Show file preview list below the drop zone */
	showPreview?: boolean;

	/** Visual variant using shadcn-svelte theme colors */
	variant?: FileDropZoneVariant;

	/** Takes a comma separated list of one or more file types.
	 *
	 * **Note:** This is client-side validation only. Always validate file types on the server.
	 *
	 * ### Usage
	 * ```svelte
	 * <FileDropZone
	 * 		accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	 * />
	 * ```
	 *
	 * ### Common Values
	 * ```svelte
	 * <FileDropZone accept="audio/*"/>
	 * <FileDropZone accept="image/*"/>
	 * <FileDropZone accept="video/*"/>
	 * ```
	 */
	accept?: string;
	/** Additional CSS classes for the container element */
	containerClass?: string;
}>;

export type FileDropZoneProps = FileDropZonePropsWithoutHTML & Omit<HTMLInputAttributes, 'multiple' | 'files'>;
