import type { Comment, Post, Todo, User } from '$lib/apis/json-placeholder/types';

import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

const BASE = 'https://jsonplaceholder.typicode.com';

faker.seed(42);

const users: User[] = Array.from({ length: 5 }, (_, i) => ({
	id: i + 1,
	name: faker.person.fullName(),
	username: faker.internet.username(),
	email: faker.internet.email(),
	address: {
		street: faker.location.street(),
		suite: `Apt ${faker.number.int({ min: 1, max: 999 })}`,
		city: faker.location.city(),
		zipcode: faker.location.zipCode(),
		geo: { lat: faker.location.latitude().toString(), lng: faker.location.longitude().toString() }
	},
	phone: faker.phone.number(),
	website: faker.internet.domainName(),
	company: { name: faker.company.name(), catchPhrase: faker.company.catchPhrase(), bs: faker.company.buzzPhrase() }
}));

const posts: Post[] = Array.from({ length: 12 }, (_, i) => ({
	userId: faker.helpers.arrayElement(users).id,
	id: i + 1,
	title: faker.lorem.sentence({ min: 3, max: 6 }),
	body: faker.lorem.paragraph()
}));

const comments: Comment[] = posts.flatMap((post) =>
	Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, (_, i) => ({
		postId: post.id,
		id: post.id * 10 + i,
		name: faker.lorem.words(3),
		email: faker.internet.email(),
		body: faker.lorem.sentences(2)
	}))
);

const todos: Todo[] = Array.from({ length: 10 }, (_, i) => ({
	userId: faker.helpers.arrayElement(users).id,
	id: i + 1,
	title: faker.hacker.phrase(),
	completed: faker.datatype.boolean()
}));

export const jsonPlaceholderHandlers = [
	http.get(`${BASE}/posts`, ({ request }) => {
		const userId = new URL(request.url).searchParams.get('userId');
		const filtered = userId ? posts.filter((p) => p.userId === Number(userId)) : posts;
		return HttpResponse.json(filtered);
	}),

	http.get(`${BASE}/posts/:id`, ({ params }) => {
		const post = posts.find((p) => p.id === Number(params.id));
		return post ? HttpResponse.json(post) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
	}),

	http.get(`${BASE}/posts/:id/comments`, ({ params }) => {
		const filtered = comments.filter((c) => c.postId === Number(params.id));
		return HttpResponse.json(filtered);
	}),

	http.post(`${BASE}/posts`, async ({ request }) => {
		const body = (await request.json()) as Omit<Post, 'id'>;
		const created: Post = { ...body, id: posts.length + 1 };
		return HttpResponse.json(created, { status: 201 });
	}),

	http.patch(`${BASE}/posts/:id`, async ({ params, request }) => {
		const patch = (await request.json()) as Partial<Post>;
		const existing = posts.find((p) => p.id === Number(params.id));
		if (!existing) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
		return HttpResponse.json({ ...existing, ...patch });
	}),

	http.delete(`${BASE}/posts/:id`, () => new HttpResponse(null, { status: 200 })),

	http.get(`${BASE}/users`, () => HttpResponse.json(users)),
	http.get(`${BASE}/users/:id`, ({ params }) => {
		const user = users.find((u) => u.id === Number(params.id));
		return user ? HttpResponse.json(user) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
	}),

	http.get(`${BASE}/todos`, () => HttpResponse.json(todos))
];
