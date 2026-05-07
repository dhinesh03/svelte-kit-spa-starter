import { http, HttpResponse } from 'msw';

const BASE = 'https://httpbin.org';

export const httpbinHandlers = [
	http.post(`${BASE}/post`, async ({ request }) => {
		const contentType = request.headers.get('content-type') ?? '';
		const url = new URL(request.url);

		const args: Record<string, string> = {};
		url.searchParams.forEach((v, k) => (args[k] = v));

		const headers: Record<string, string> = {};
		request.headers.forEach((v, k) => (headers[k] = v));

		let json: unknown = null;
		const form: Record<string, unknown> = {};
		const files: Record<string, string> = {};

		if (contentType.includes('application/json')) {
			json = await request.json().catch(() => null);
		} else if (contentType.includes('multipart/form-data')) {
			const fd = await request.formData();
			fd.forEach((v, k) => {
				if (v instanceof File) files[k] = v.name;
				else form[k] = v;
			});
		}

		return HttpResponse.json({
			args,
			headers,
			json,
			form,
			files,
			url: request.url,
			origin: '127.0.0.1'
		});
	})
];
