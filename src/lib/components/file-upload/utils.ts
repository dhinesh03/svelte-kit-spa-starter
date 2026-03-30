// Utilities for working with file sizes
export const BYTE = 1;
export const KILOBYTE = 1024;
export const MEGABYTE = 1024 * KILOBYTE;
export const GIGABYTE = 1024 * MEGABYTE;

export const displaySize = (bytes: number): string => {
	if (bytes < 0 || !isFinite(bytes)) return '\u2014';
	if (bytes < KILOBYTE) return `${bytes.toFixed(0)} B`;
	if (bytes < MEGABYTE) return `${(bytes / KILOBYTE).toFixed(1)} KB`;
	if (bytes < GIGABYTE) return `${(bytes / MEGABYTE).toFixed(1)} MB`;
	return `${(bytes / GIGABYTE).toFixed(1)} GB`;
};

// Common file size limits
export const MAX_FILE_SIZE_1MB = MEGABYTE;
export const MAX_FILE_SIZE_5MB = 5 * MEGABYTE;
export const MAX_FILE_SIZE_10MB = 10 * MEGABYTE;
export const MAX_FILE_SIZE_50MB = 50 * MEGABYTE;
export const MAX_FILE_SIZE_100MB = 100 * MEGABYTE;

// Utilities for limiting accepted files
export const ACCEPT_IMAGE = 'image/*';
export const ACCEPT_VIDEO = 'video/*';
export const ACCEPT_AUDIO = 'audio/*';
export const ACCEPT_DOCUMENT = '.pdf,.doc,.docx,.txt,.rtf';
export const ACCEPT_SPREADSHEET = '.xls,.xlsx,.csv';
export const ACCEPT_PRESENTATION = '.ppt,.pptx';
export const ACCEPT_ARCHIVE = '.zip,.rar,.7z,.tar,.gz';

// Common accept combinations
export const ACCEPT_MEDIA = `${ACCEPT_IMAGE},${ACCEPT_VIDEO},${ACCEPT_AUDIO}`;
export const ACCEPT_OFFICE = `${ACCEPT_DOCUMENT},${ACCEPT_SPREADSHEET},${ACCEPT_PRESENTATION}`;

const MIME_WILDCARD_LABELS: Record<string, string> = {
	'image/*': 'Images',
	'video/*': 'Videos',
	'audio/*': 'Audio',
	'text/*': 'Text',
	'application/*': 'Files'
};

/** Format accept string for user-friendly display */
export const formatAcceptDisplay = (accept: string): string => {
	return accept
		.split(',')
		.map((t) => {
			const trimmed = t.trim();
			if (trimmed.startsWith('.')) return trimmed.slice(1).toUpperCase();
			if (MIME_WILDCARD_LABELS[trimmed]) return MIME_WILDCARD_LABELS[trimmed];
			return trimmed;
		})
		.join(', ');
};
