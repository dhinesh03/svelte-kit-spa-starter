import type { CancellableRequest } from '$lib/services/fetch';

import { jsonPlaceholderApi } from '$lib/services/fetch';

import type { User } from './types';

export function getUsers(signal?: AbortSignal): CancellableRequest<User[]> {
	return jsonPlaceholderApi.get<User[]>('/users', { signal });
}

export function getUser(id: number, signal?: AbortSignal): CancellableRequest<User> {
	return jsonPlaceholderApi.get<User>(`/users/${id}`, { signal });
}
