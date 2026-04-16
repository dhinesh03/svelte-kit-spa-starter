import type { CancellableRequest, UploadProgressEvent } from '$lib/services/fetch';

import { httpbinApi } from '$lib/services/fetch';

import type { HttpbinPostResponse } from './types';

export function uploadFile(file: File, onProgress?: (progress: UploadProgressEvent) => void): CancellableRequest<HttpbinPostResponse> {
	return httpbinApi.upload<HttpbinPostResponse>('/post', file, {
		fieldName: 'file',
		onProgress
	});
}
