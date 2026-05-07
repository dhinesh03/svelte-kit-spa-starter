import { startMockServiceWorker } from '$lib/mocks';

// This disables server-side rendering (SSR) for the entire app
// Making it a true Single Page Application (SPA)
export const ssr = false;

export const prerender = false;

// This tells SvelteKit to use the browser's router
export const csr = true;

export async function load() {
	await startMockServiceWorker();
	return {};
}
