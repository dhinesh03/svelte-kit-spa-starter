import type { CancellableRequest } from '$lib/services/fetch';

import { jsonPlaceholderApi } from '$lib/services/fetch';

import type { Todo } from './types';

export function getTodos(params?: { completed?: boolean }, signal?: AbortSignal): CancellableRequest<Todo[]> {
	return jsonPlaceholderApi.get<Todo[]>('/todos', { params, signal });
}

export function getTodosByUser(userId: number, signal?: AbortSignal): CancellableRequest<Todo[]> {
	return jsonPlaceholderApi.get<Todo[]>('/todos', { params: { userId }, signal });
}
