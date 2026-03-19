import FileDropZone from './FileDropZone.svelte';
import { type FileRejectedReason, type FileDropZoneProps, type FileDropZoneVariant } from './types';

export {
	displaySize,
	formatAcceptDisplay,
	BYTE,
	KILOBYTE,
	MEGABYTE,
	GIGABYTE,
	MAX_FILE_SIZE_1MB,
	MAX_FILE_SIZE_5MB,
	MAX_FILE_SIZE_10MB,
	MAX_FILE_SIZE_50MB,
	MAX_FILE_SIZE_100MB,
	ACCEPT_IMAGE,
	ACCEPT_VIDEO,
	ACCEPT_AUDIO,
	ACCEPT_DOCUMENT,
	ACCEPT_SPREADSHEET,
	ACCEPT_PRESENTATION,
	ACCEPT_ARCHIVE,
	ACCEPT_MEDIA,
	ACCEPT_OFFICE
} from './utils';

export { FileDropZone, type FileRejectedReason, type FileDropZoneProps, type FileDropZoneVariant };
