/**
 * @fileoverview Pre-configured FetchService instances for each backend.
 *
 * Each API target gets its own FetchService with the appropriate base URL,
 * headers, and auth strategy. Import the instance you need:
 *
 * @example
 * ```ts
 * import { jsonPlaceholderApi } from '$lib/services/api-service';
 *
 * const { request, cancel } = jsonPlaceholderApi.get<Post[]>('/posts', {
 *   params: { userId: 1 },
 *   timeout: 5000,
 * });
 *
 * const { data } = await request;
 * ```
 */

import { FetchService } from './fetch-service';

export const jsonPlaceholderApi = new FetchService({
	baseUrl: 'https://jsonplaceholder.typicode.com'
});

// ---------------------------------------------------------------------------
// Add more instances as needed, for example:
// ---------------------------------------------------------------------------
//
// import { authService } from './auth-service';
//
// export const internalApi = new FetchService({
//   baseUrl: import.meta.env.VITE_API_BASE_URL,
//   getAuthToken: () => authService.getAccessToken().then((t) => t || null),
// });
//
// export const analyticsApi = new FetchService({
//   baseUrl: import.meta.env.VITE_ANALYTICS_API_URL,
//   defaultHeaders: { 'X-Api-Key': import.meta.env.VITE_ANALYTICS_API_KEY },
// });
