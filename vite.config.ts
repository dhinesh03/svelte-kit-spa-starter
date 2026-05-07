import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: 'localhost',
		port: 3000
		// proxy: {
		// 	'/api': {
		// 		target: 'http://localhost:8080',
		// 		changeOrigin: true,
		// 		secure: false
		// 	}
		// }
	},
	preview: {
		port: 3000
	},
	test: {
		expect: { requireAssertions: true },
		setupFiles: ['./vitest-setup.ts'],
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
