import type { CancellableRequest } from '$lib/services/fetch';

import { jsonPlaceholderApi } from '$lib/services/fetch';

import type { Comment, Post } from './types';

export function getPosts(params?: { userId?: number }, signal?: AbortSignal): CancellableRequest<Post[]> {
	return jsonPlaceholderApi.get<Post[]>('/posts', { params, signal });
}

export function getPost(id: number, signal?: AbortSignal): CancellableRequest<Post> {
	return jsonPlaceholderApi.get<Post>(`/posts/${id}`, { signal });
}

export function getPostComments(postId: number, signal?: AbortSignal): CancellableRequest<Comment[]> {
	return jsonPlaceholderApi.get<Comment[]>(`/posts/${postId}/comments`, { signal });
}

export function createPost(data: Omit<Post, 'id'>, signal?: AbortSignal): CancellableRequest<Post> {
	return jsonPlaceholderApi.post<Post>('/posts', { payload: data, signal });
}

export function updatePost(id: number, data: Partial<Post>, signal?: AbortSignal): CancellableRequest<Post> {
	return jsonPlaceholderApi.patch<Post>(`/posts/${id}`, { payload: data, signal });
}

export function deletePost(id: number, signal?: AbortSignal): CancellableRequest<void> {
	return jsonPlaceholderApi.delete<void>(`/posts/${id}`, { signal });
}
