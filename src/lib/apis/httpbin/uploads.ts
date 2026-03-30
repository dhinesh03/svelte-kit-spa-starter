import type { CancellableRequest, UploadProgressEvent } from '$lib/services/fetch-service';

import { httpbinApi } from '$lib/services/api-service';

import type { HttpbinPostResponse } from './types';

export function uploadFile(file: File, onProgress?: (progress: UploadProgressEvent) => void): CancellableRequest<HttpbinPostResponse> {
	return httpbinApi.upload<HttpbinPostResponse>('/post', file, {
		fieldName: 'file',
		onProgress
	});
}
