import { describe, it, expect, vi } from 'vitest';

import type { CancellableRequest } from './fetch-service';

import { fetchData } from './fetch-data';

function makeCancellable<T>(data: T): CancellableRequest<T> {
	return {
		request: Promise.resolve({ data, response: new Response() }),
		cancel: vi.fn()
	};
}

function makeFailingCancellable(error: Error): CancellableRequest<never> {
	return {
		request: Promise.reject(error),
		cancel: vi.fn()
	};
}

describe('fetchData', () => {
	it('unwraps data from a successful CancellableRequest', async () => {
		const controller = new AbortController();
		const result = await fetchData(() => makeCancellable([1, 2, 3]), controller.signal);
		expect(result).toEqual([1, 2, 3]);
	});

	it('passes signal to the factory', async () => {
		const controller = new AbortController();
		const factory = vi.fn((_signal: AbortSignal) => makeCancellable('ok'));

		await fetchData(factory, controller.signal);

		expect(factory).toHaveBeenCalledWith(controller.signal);
	});

	it('calls cancel when the signal aborts', async () => {
		const controller = new AbortController();
		const cancelFn = vi.fn();
		const cancellable: CancellableRequest<string> = {
			request: new Promise(() => {}), // never resolves
			cancel: cancelFn
		};

		// Start fetchData but don't await (it will hang)
		fetchData(() => cancellable, controller.signal);

		controller.abort();

		expect(cancelFn).toHaveBeenCalledWith('dependency changed');
	});

	it('propagates errors from the request', async () => {
		const controller = new AbortController();
		const error = new Error('network failure');

		await expect(fetchData(() => makeFailingCancellable(error), controller.signal)).rejects.toThrow('network failure');
	});

	it('calls cancel immediately when signal is already aborted', async () => {
		const controller = new AbortController();
		controller.abort();

		const cancelFn = vi.fn();
		const cancellable: CancellableRequest<string> = {
			request: Promise.reject(new DOMException('The operation was aborted.', 'AbortError')),
			cancel: cancelFn
		};

		await expect(fetchData(() => cancellable, controller.signal)).rejects.toThrow('The operation was aborted.');
		expect(cancelFn).toHaveBeenCalledWith('dependency changed');
	});
});
