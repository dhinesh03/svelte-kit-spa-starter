import { jsonPlaceholderApi } from '$lib/services/api-service';
import type { CancellableRequest } from '$lib/services/fetch-service';
import type { Comment, Post } from './types';

export function getPosts(params?: { userId?: number }): CancellableRequest<Post[]> {
	return jsonPlaceholderApi.get<Post[]>('/posts', { params });
}

export function getPost(id: number): CancellableRequest<Post> {
	return jsonPlaceholderApi.get<Post>(`/posts/${id}`);
}

export function getPostComments(postId: number): CancellableRequest<Comment[]> {
	return jsonPlaceholderApi.get<Comment[]>(`/posts/${postId}/comments`);
}

export function createPost(data: Omit<Post, 'id'>): CancellableRequest<Post> {
	return jsonPlaceholderApi.post<Post>('/posts', { payload: data });
}

export function updatePost(id: number, data: Partial<Post>): CancellableRequest<Post> {
	return jsonPlaceholderApi.patch<Post>(`/posts/${id}`, { payload: data });
}

export function deletePost(id: number): CancellableRequest<void> {
	return jsonPlaceholderApi.delete<void>(`/posts/${id}`);
}
