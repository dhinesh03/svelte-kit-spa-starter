import { jsonPlaceholderApi } from '$lib/services/api-service';
import type { CancellableRequest } from '$lib/services/fetch-service';
import type { Todo } from './types';

export function getTodos(params?: { completed?: boolean }): CancellableRequest<Todo[]> {
	return jsonPlaceholderApi.get<Todo[]>('/todos', { params });
}

export function getTodosByUser(userId: number): CancellableRequest<Todo[]> {
	return jsonPlaceholderApi.get<Todo[]>('/todos', { params: { userId } });
}
