/**
 * Starts MSW in the browser when VITE_ENABLE_MSW is truthy.
 *
 * The worker module is dynamically imported so MSW is excluded from production
 * bundles unless the flag is enabled at build time.
 */
export async function startMockServiceWorker(): Promise<void> {
	if (typeof window === 'undefined') return;
	if (!import.meta.env.VITE_ENABLE_MSW) return;

	const { worker } = await import('./browser');
	await worker.start({
		onUnhandledRequest: 'bypass',
		serviceWorker: { url: '/mockServiceWorker.js' }
	});
}
