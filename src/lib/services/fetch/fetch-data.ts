import type { CancellableRequest } from './fetch-service';

/**
 * Bridges CancellableRequest with AbortSignal-based cancellation (e.g. runed resource).
 * Wires the signal's abort to cancel the request and unwraps the data.
 */
export async function fetchData<T>(factory: (signal: AbortSignal) => CancellableRequest<T>, signal: AbortSignal): Promise<T> {
	const { request, cancel } = factory(signal);
	if (signal.aborted) {
		cancel('dependency changed');
	} else {
		signal.addEventListener('abort', () => cancel('dependency changed'), { once: true });
	}
	const { data } = await request;
	return data;
}
