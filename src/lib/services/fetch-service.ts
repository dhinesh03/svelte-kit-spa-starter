/**
 * @fileoverview A lightweight, type-safe HTTP client with cancellation, timeouts, and upload progress.
 */

/** Public options for HTTP requests */
interface RequestOptions extends Omit<RequestInit, 'signal'> {
	/** Request timeout in milliseconds */
	timeout?: number;
	/** URL query parameters */
	params?: Record<string, string | number | boolean | undefined | null>;
	/** Request body (automatically serialized for JSON) */
	payload?: Record<string, unknown> | unknown[] | FormData;
	/** External AbortSignal for cancellation */
	signal?: AbortSignal;
	/** Bypass browser cache */
	forceRefresh?: boolean;
}

/** Internal options that include upload progress callback */
interface InternalRequestOptions extends RequestOptions {
	/** Callback for upload progress (only works with FormData) — internal use only */
	onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

/** Result of a successful HTTP request */
interface RequestResult<T> {
	/** Parsed response data */
	data: T;
	/** Raw Response object */
	response: Response;
}

/** Upload progress information */
interface UploadProgressEvent {
	/** Bytes uploaded */
	loaded: number;
	/** Total bytes (0 if unknown) */
	total: number;
	/** Percentage complete (0-100) */
	percentage: number;
}

/** A request that can be cancelled */
interface CancellableRequest<T> {
	/** The request promise */
	request: Promise<RequestResult<T>>;
	/** Cancel the request */
	cancel: (reason?: string) => void;
}

/** Configuration for FetchService */
interface FetchServiceConfig {
	/** Base URL prepended to all endpoints */
	baseUrl?: string;
	/** Default headers included in all requests */
	defaultHeaders?: HeadersInit;
	/** Async function to retrieve auth token */
	getAuthToken?: () => Promise<string | null>;
}

/** Options for file uploads */
interface UploadOptions extends Omit<RequestOptions, 'method' | 'payload'> {
	/** Form field name for the file (default: 'file') */
	fieldName?: string;
	/** Additional form fields to include */
	additionalFields?: Record<string, string>;
	/** Upload progress callback */
	onProgress?: (progress: UploadProgressEvent) => void;
	/** HTTP method (default: 'POST') */
	method?: 'POST' | 'PUT' | 'PATCH';
}

/** Options for SSE connections */
interface SSEOptions {
	/** External AbortSignal for cancellation */
	signal?: AbortSignal;
}

/** Constructor type for EventSource with fetch option (requires polyfill) */
type EventSourceConstructor = new (url: string | URL, init?: EventSourceInit & { fetch?: typeof fetch }) => EventSource;

/** Prepared request configuration returned by buildRequestConfig */
interface PreparedRequest {
	url: string;
	headers: Headers;
	signal: AbortSignal;
	fetchOptions: RequestInit;
}

/**
 * Extracts a user-facing error message from an API error response body.
 * Returns generic, user-friendly messages instead of detailed server errors.
 * The actual error details are logged to console for debugging.
 */
function getErrorMessageFromBody(responseBody: unknown, status: number, statusText: string): string {
	// Log detailed error for debugging (only in development or for developer tools)
	if (import.meta.env.DEV) {
		console.error('API Error:', {
			status,
			statusText,
			responseBody
		});
	}

	// If the server returned a detail message, surface it directly
	if (responseBody && typeof responseBody === 'object' && 'detail' in responseBody) {
		const detail = (responseBody as Record<string, unknown>).detail;
		if (typeof detail === 'string' && detail.trim()) {
			return detail.trim();
		}
		if (Array.isArray(detail) && detail.length > 0) {
			return detail.map((d) => (typeof d === 'string' ? d : ((d as Record<string, unknown>)?.msg ?? JSON.stringify(d)))).join('; ');
		}
	}

	// Map common HTTP status codes to user-friendly messages
	switch (status) {
		case 400:
			return 'Invalid request. Please check your input and try again.';
		case 401:
			return 'Authentication required. Please log in and try again.';
		case 403:
			return 'You do not have permission to perform this action.';
		case 404:
			return 'The requested resource was not found.';
		case 409:
			return 'This action conflicts with existing data.';
		case 422:
			return 'Invalid data submitted. Please check your input.';
		case 429:
			return 'Too many requests. Please wait a moment and try again.';
		case 500:
		case 502:
		case 503:
		case 504:
			return 'A server error occurred. Please try again later.';
		default:
			if (status >= 400 && status < 500) {
				return 'Unable to complete your request. Please try again.';
			}
			if (status >= 500) {
				return 'A server error occurred. Please try again later.';
			}
			return 'An unexpected error occurred. Please try again.';
	}
}

/**
 * Throws a FetchError after reading and parsing the error response body.
 */
async function throwFetchError(response: Response): Promise<never> {
	const contentType = response.headers.get('content-type');
	const isJson = contentType?.includes('application/json') ?? false;
	const responseBody = isJson ? await response.json() : await response.text();
	const message = getErrorMessageFromBody(responseBody, response.status, response.statusText);

	throw new FetchError(message, response.status, response.statusText, responseBody);
}

/**
 * Error thrown when an HTTP request fails.
 * Includes status code, status text, and the response body for debugging.
 */
class FetchError extends Error {
	public readonly status: number;
	public readonly statusText: string;
	public readonly responseBody: unknown;

	constructor(message: string, status: number, statusText: string, responseBody: unknown) {
		super(message);
		this.name = 'FetchError';
		this.status = status;
		this.statusText = statusText;
		this.responseBody = responseBody;

		// Maintains proper stack trace for where error was thrown (ES5 compatibility)
		Object.setPrototypeOf(this, FetchError.prototype);
	}
}

/**
 * A service for making HTTP requests with support for cancellation,
 * timeouts, authentication, and query parameters.
 *
 * @example
 * ```ts
 * const api = new FetchService({
 *   baseUrl: 'https://api.example.com',
 *   getAuthToken: async () => localStorage.getItem('token'),
 * });
 *
 * const { request, cancel } = api.get<User[]>('/users', { timeout: 5000 });
 *
 * try {
 *   const { data, response } = await request;
 *   console.log(data);
 * } catch (err) {
 *   if (err instanceof FetchError) {
 *     console.error(`HTTP ${err.status}: ${err.message}`);
 *   }
 * }
 * ```
 */
class FetchService {
	private readonly baseUrl: string;
	private readonly defaultHeaders: HeadersInit;
	private readonly getAuthToken?: () => Promise<string | null>;

	constructor(config: FetchServiceConfig = {}) {
		this.baseUrl = config.baseUrl ?? '';
		this.defaultHeaders = config.defaultHeaders ?? {};
		this.getAuthToken = config.getAuthToken;
	}

	/**
	 * Converts params object to URL query string.
	 * Skips undefined and null values.
	 */
	private toQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
		if (!params) return '';

		const urlParams = new URLSearchParams();

		for (const [key, value] of Object.entries(params)) {
			if (value != null) {
				urlParams.append(key, String(value));
			}
		}

		const str = urlParams.toString();
		return str ? `?${str}` : '';
	}

	/**
	 * Builds full URL from endpoint, handling trailing/leading slashes.
	 */
	private buildUrl(endpoint: string): string {
		if (!this.baseUrl) return endpoint;

		const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
		const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

		return `${base}${path}`;
	}

	/**
	 * Builds headers, resolves auth token, serializes body, and combines abort signals.
	 * Shared by request() and download() to eliminate duplication.
	 */
	private async buildRequestConfig(
		url: string,
		options: InternalRequestOptions,
		controller: AbortController,
		acceptHeader: string
	): Promise<PreparedRequest> {
		const token = this.getAuthToken ? await this.getAuthToken() : null;

		// Build headers
		const headers = new Headers(this.defaultHeaders);
		headers.set('Accept', acceptHeader);

		if (options.headers) {
			const customHeaders = new Headers(options.headers);
			customHeaders.forEach((value, key) => headers.set(key, value));
		}

		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		// Extract custom options, pass rest to fetch
		const { payload, signal: externalSignal, onUploadProgress: _, timeout: __, params: ___, forceRefresh, ...fetchOptions } = options;

		// Warn in dev if payload is used with GET
		if (import.meta.env.DEV && fetchOptions.method === 'GET' && payload) {
			console.warn('FetchService: payload is ignored for GET requests. Use params instead.');
		}

		// Set body for non-GET requests
		if (fetchOptions.method !== 'GET' && payload) {
			if (payload instanceof FormData) {
				fetchOptions.body = payload;
			} else {
				headers.set('Content-Type', 'application/json');
				fetchOptions.body = JSON.stringify(payload);
			}
		}

		// Combine all abort signals
		const timeoutSignal = options.timeout ? AbortSignal.timeout(options.timeout) : undefined;
		const signals: AbortSignal[] = [controller.signal];
		if (timeoutSignal) signals.push(timeoutSignal);
		if (externalSignal) signals.push(externalSignal);

		const signal = signals.length === 1 ? signals[0] : AbortSignal.any(signals);

		return {
			url,
			headers,
			signal,
			fetchOptions: {
				...fetchOptions,
				cache: forceRefresh ? 'reload' : 'default',
				headers,
				signal
			}
		};
	}

	/**
	 * Parses XHR response headers into a Headers object.
	 * Correctly handles header values containing ': '.
	 */
	private parseXHRHeaders(xhr: XMLHttpRequest): Headers {
		const headers = new Headers();
		const headersString = xhr.getAllResponseHeaders();

		for (const line of headersString.split('\r\n')) {
			if (!line) continue;

			const colonIndex = line.indexOf(': ');
			if (colonIndex > 0) {
				headers.append(line.substring(0, colonIndex), line.substring(colonIndex + 2));
			}
		}

		return headers;
	}

	/**
	 * Uploads with XHR to enable progress tracking.
	 * Falls back to this when onUploadProgress is provided with FormData.
	 */
	private uploadWithProgress(
		url: string,
		headers: Headers,
		method: string,
		body: FormData,
		signal: AbortSignal,
		onUploadProgress: (event: ProgressEvent) => void
	): Promise<Response> {
		return new Promise((resolve, reject) => {
			// Check if already aborted before starting
			if (signal.aborted) {
				reject(new DOMException('The operation was aborted.', 'AbortError'));
				return;
			}

			const xhr = new XMLHttpRequest();
			let settled = false;

			const cleanup = (): void => {
				signal.removeEventListener('abort', abortHandler);
				xhr.upload.removeEventListener('progress', progressHandler);
			};

			const abortHandler = (): void => {
				if (settled) return;
				settled = true;
				cleanup();
				xhr.abort();
				reject(new DOMException('The operation was aborted.', 'AbortError'));
			};

			const progressHandler = (event: ProgressEvent): void => {
				if (event.lengthComputable) {
					onUploadProgress(event);
				}
			};

			signal.addEventListener('abort', abortHandler);
			xhr.upload.addEventListener('progress', progressHandler);

			xhr.addEventListener('load', () => {
				if (settled) return;
				settled = true;
				cleanup();

				resolve(
					new Response(xhr.response, {
						status: xhr.status,
						statusText: xhr.statusText,
						headers: this.parseXHRHeaders(xhr)
					})
				);
			});

			xhr.addEventListener('error', () => {
				if (settled) return;
				settled = true;
				cleanup();
				reject(new TypeError('Network request failed'));
			});

			xhr.open(method, url);

			// Set headers, letting browser set Content-Type for FormData
			headers.forEach((value, key) => {
				if (key.toLowerCase() !== 'content-type') {
					xhr.setRequestHeader(key, value);
				}
			});

			xhr.send(body);
		});
	}

	/**
	 * Core request method. Returns a cancellable request object.
	 */
	private request<T = unknown>(endpoint: string, options: InternalRequestOptions = {}): CancellableRequest<T> {
		const controller = new AbortController();

		const cancel = (reason?: string): void => {
			controller.abort(reason);
		};

		const url = this.buildUrl(endpoint) + this.toQueryString(options.params);

		const requestPromise = async (): Promise<RequestResult<T>> => {
			const { headers, signal, fetchOptions } = await this.buildRequestConfig(url, options, controller, 'application/json');

			// Make request
			let response: Response;

			if (options.onUploadProgress && options.payload instanceof FormData) {
				response = await this.uploadWithProgress(
					url,
					headers,
					fetchOptions.method ?? 'POST',
					options.payload,
					signal,
					options.onUploadProgress
				);
			} else {
				response = await fetch(url, fetchOptions);
			}

			// Parse response
			const contentType = response.headers.get('content-type');
			const isJson = contentType?.includes('application/json') ?? false;

			if (!response.ok) {
				await throwFetchError(response);
			}

			// Handle empty responses (204 No Content, 205 Reset Content)
			const contentLength = response.headers.get('content-length');
			const isEmpty = response.status === 204 || response.status === 205 || contentLength === '0';

			let data: T;
			if (isEmpty) {
				data = null as T;
			} else if (isJson) {
				data = (await response.json()) as T;
			} else {
				data = (await response.text()) as unknown as T;
			}

			return { data, response };
		};

		return { request: requestPromise(), cancel };
	}

	/**
	 * Makes a GET request.
	 * @param endpoint - API endpoint
	 * @param options - Request options
	 */
	public get<T = unknown>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): CancellableRequest<T> {
		return this.request<T>(endpoint, { ...options, method: 'GET' });
	}

	/**
	 * Makes a POST request.
	 * @param endpoint - API endpoint
	 * @param options - Request options (use `payload` for request body)
	 */
	public post<T = unknown>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): CancellableRequest<T> {
		return this.request<T>(endpoint, { ...options, method: 'POST' });
	}

	/**
	 * Makes a PUT request.
	 * @param endpoint - API endpoint
	 * @param options - Request options (use `payload` for request body)
	 */
	public put<T = unknown>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): CancellableRequest<T> {
		return this.request<T>(endpoint, { ...options, method: 'PUT' });
	}

	/**
	 * Makes a DELETE request.
	 * @param endpoint - API endpoint
	 * @param options - Request options
	 */
	public delete<T = unknown>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): CancellableRequest<T> {
		return this.request<T>(endpoint, { ...options, method: 'DELETE' });
	}

	/**
	 * Makes a PATCH request.
	 * @param endpoint - API endpoint
	 * @param options - Request options (use `payload` for request body)
	 */
	public patch<T = unknown>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): CancellableRequest<T> {
		return this.request<T>(endpoint, { ...options, method: 'PATCH' });
	}

	/**
	 * Uploads a file or FormData with progress tracking.
	 * @param endpoint - API endpoint
	 * @param fileOrFormData - File to upload or pre-constructed FormData
	 * @param options - Upload options including progress callback and HTTP method
	 */
	public upload<T = unknown>(endpoint: string, fileOrFormData: File | FormData, options: UploadOptions = {}): CancellableRequest<T> {
		let formData: FormData;

		if (fileOrFormData instanceof FormData) {
			formData = fileOrFormData;
		} else {
			formData = new FormData();
			formData.append(options.fieldName ?? 'file', fileOrFormData);
		}

		if (options.additionalFields) {
			for (const [key, value] of Object.entries(options.additionalFields)) {
				formData.append(key, value);
			}
		}

		const { onProgress, fieldName: _, additionalFields: __, method = 'POST', ...requestOptions } = options;

		return this.request<T>(endpoint, {
			...requestOptions,
			method,
			payload: formData,
			onUploadProgress: onProgress
				? (e: ProgressEvent) =>
						onProgress({
							loaded: e.loaded,
							total: e.total ?? 0,
							percentage: e.total ? Math.round((e.loaded / e.total) * 100) : 0
						})
				: undefined
		});
	}

	/**
	 * Downloads a file by making a request and returning the raw Response.
	 * Does not consume the response body, allowing the caller to extract blob/arrayBuffer/etc.
	 * @param endpoint - API endpoint
	 * @param options - Request options
	 */
	public download(endpoint: string, options: RequestOptions = {}): CancellableRequest<Response> {
		const controller = new AbortController();

		const cancel = (reason?: string): void => {
			controller.abort(reason);
		};

		const url = this.buildUrl(endpoint) + this.toQueryString(options.params);

		const requestPromise = async (): Promise<RequestResult<Response>> => {
			const { fetchOptions } = await this.buildRequestConfig(url, options, controller, '*/*');

			const response = await fetch(url, fetchOptions);

			if (!response.ok) {
				await throwFetchError(response);
			}

			return { data: response, response };
		};

		return { request: requestPromise(), cancel };
	}

	/**
	 * Subscribes to a Server-Sent Events endpoint.
	 *
	 * NOTE: Requires an EventSource polyfill that supports the `fetch` option
	 * (e.g., @microsoft/fetch-event-source) for authenticated connections.
	 * Standard EventSource does not support custom headers.
	 *
	 * @param endpoint - SSE endpoint
	 * @param options - SSE options
	 */
	public async subscribeToSSE(endpoint: string, options: SSEOptions = {}): Promise<EventSource> {
		const token = this.getAuthToken ? await this.getAuthToken() : null;
		const url = this.buildUrl(endpoint);

		// Validate polyfill availability when auth is needed
		if (token) {
			const testSource = new EventSource('data:text/event-stream,');
			const supportsFetch =
				'fetch' in Object.getPrototypeOf(testSource).constructor.prototype ||
				typeof (testSource as unknown as Record<string, unknown>).close === 'function';
			testSource.close();

			if (!supportsFetch) {
				throw new Error(
					'Authenticated SSE requires an EventSource polyfill that supports the fetch option ' + '(e.g., @microsoft/fetch-event-source).'
				);
			}
		}

		const EventSourceWithFetch = EventSource as unknown as EventSourceConstructor;

		const eventSource = new EventSourceWithFetch(url, {
			fetch: (input: RequestInfo | URL, init?: RequestInit) =>
				fetch(input, {
					...init,
					signal: options.signal,
					headers: {
						...init?.headers,
						Accept: 'text/event-stream',
						...(token ? { Authorization: `Bearer ${token}` } : {})
					}
				})
		});

		return eventSource;
	}
}

export { FetchService, FetchError };
export type { RequestOptions, RequestResult, UploadProgressEvent, CancellableRequest, FetchServiceConfig, UploadOptions, SSEOptions };
