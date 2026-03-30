export interface HttpbinPostResponse {
	args: Record<string, string>;
	data: string;
	files: Record<string, string>;
	form: Record<string, string>;
	headers: Record<string, string>;
	json: unknown;
	origin: string;
	url: string;
}
