import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	// MSAL returns auth responses in the URL hash (#code=... or #error=...).
	// SvelteKit strips hashes from the `url` param, so check window directly.
	// Skip the redirect so handleRedirectPromise() can process the auth code.
	if (typeof window !== 'undefined' && /[#&](code|error)=/.test(window.location.hash)) return;

	redirect(302, '/showcase');
};
