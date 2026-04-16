/**
 * Standalone SSE connection factory.
 * Extracted from FetchService because SSE has a fundamentally different lifecycle
 * (persistent EventSource vs request/response CancellableRequest).
 */

interface SSEConfig {
	baseUrl?: string;
	getAuthToken?: () => Promise<string | null>;
}

interface SSEOptions {
	signal?: AbortSignal;
}

type EventSourceConstructor = new (url: string | URL, init?: EventSourceInit & { fetch?: typeof fetch }) => EventSource;

export function createSSEConnection(endpoint: string, config: SSEConfig, options: SSEOptions = {}): EventSource {
	const base = config.baseUrl ? (config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl) : '';
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const url = `${base}${path}`;

	const needsAuth = !!config.getAuthToken;

	if (needsAuth) {
		const proto = Object.getPrototypeOf(EventSource.prototype) as Record<string, unknown> | null;
		const constructorAcceptsFetch = (proto !== null && 'fetch' in proto) || 'fetch' in (EventSource as unknown as Record<string, unknown>);
		if (!constructorAcceptsFetch) {
			throw new Error('Authenticated SSE requires an EventSource polyfill that supports the fetch option (e.g., extended-eventsource).');
		}
	}

	const getAuthToken = config.getAuthToken;
	const EventSourceWithFetch = EventSource as unknown as EventSourceConstructor;

	return new EventSourceWithFetch(url, {
		fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
			const freshToken = getAuthToken ? await getAuthToken() : null;
			return fetch(input, {
				...init,
				signal: options.signal,
				headers: {
					...init?.headers,
					Accept: 'text/event-stream',
					...(freshToken ? { Authorization: `Bearer ${freshToken}` } : {})
				}
			});
		}
	});
}

export type { SSEConfig, SSEOptions };
