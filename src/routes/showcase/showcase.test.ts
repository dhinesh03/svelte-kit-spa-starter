import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const showcaseDir = resolve(import.meta.dirname, '.');

const expectedRoutes = ['components', 'ag-grid', 'api'];

describe('showcase routes', () => {
	it('should have a layout file', () => {
		expect(existsSync(resolve(showcaseDir, '+layout.svelte'))).toBe(true);
	});

	it('should have a dashboard page', () => {
		expect(existsSync(resolve(showcaseDir, '+page.svelte'))).toBe(true);
	});

	it.each(expectedRoutes)('should have route: /showcase/%s', (route) => {
		const routeDir = resolve(showcaseDir, route);
		expect(existsSync(resolve(routeDir, '+page.svelte'))).toBe(true);
	});

	it('should have all expected sub-routes and no unexpected ones', () => {
		const dirs = readdirSync(showcaseDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.sort();
		expect(dirs).toEqual([...expectedRoutes].sort());
	});
});

describe('root redirect', () => {
	it('should redirect to /showcase', async () => {
		const { load } = await import('../+page');
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(load as any)();
			expect.fail('should have thrown a redirect');
		} catch (e: unknown) {
			const error = e as { status: number; location: string };
			expect(error.status).toBe(302);
			expect(error.location).toBe('/showcase');
		}
	});
});
