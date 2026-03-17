/**
 * SvelteKit NavigationClient for MSAL
 *
 */

import { goto } from '$app/navigation';
import { NavigationClient, type NavigationOptions } from '@azure/msal-browser';

/**
 * Custom NavigationClient for SvelteKit
 *
 * @example
 * ```typescript
 * // In your auth initialization
 * import { CustomNavigationClient } from './navigation';
 *
 * const authService = createAuthService(config, new CustomNavigationClient());
 * ```
 */
export class CustomNavigationClient extends NavigationClient {
	/**
	 * Navigate to a URL using SvelteKit's router
	 *
	 * @param url - Target URL
	 * @param options - Navigation options from MSAL
	 * @returns Always returns false to prevent MSAL's default navigation
	 */
	async navigateInternal(url: string, options: NavigationOptions): Promise<boolean> {
		const parsed = new URL(url, window.location.origin);
		if (parsed.origin !== window.location.origin) {
			// Reject navigation to a different origin
			return false;
		}
		const relativePath = parsed.pathname + parsed.search + parsed.hash;

		// Handle different navigation scenarios
		if (options.noHistory) {
			// Replace current history entry
			await goto(relativePath, { replaceState: true });
		} else {
			// Normal navigation
			await goto(relativePath);
		}

		// Return false to tell MSAL we handled the navigation
		return false;
	}

	/**
	 * Navigate to an external URL
	 * For external URLs, we let the browser handle it normally
	 *
	 * @param url - External URL
	 * @param options - Navigation options
	 * @returns Always returns true to let browser handle external navigation
	 */
	async navigateExternal(url: string, options: NavigationOptions): Promise<boolean> {
		// For external URLs (like logout redirect), let browser handle it
		if (options.noHistory) {
			window.location.replace(url);
		} else {
			window.location.assign(url);
		}

		// Return true to indicate we're letting browser handle it
		return true;
	}
}
