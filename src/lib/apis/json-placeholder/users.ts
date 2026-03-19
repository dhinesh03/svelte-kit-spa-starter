import type { CancellableRequest } from '$lib/services/fetch-service';

import { jsonPlaceholderApi } from '$lib/services/api-service';

import type { User } from './types';

export function getUsers(): CancellableRequest<User[]> {
	return jsonPlaceholderApi.get<User[]>('/users');
}

export function getUser(id: number): CancellableRequest<User> {
	return jsonPlaceholderApi.get<User>(`/users/${id}`);
}
