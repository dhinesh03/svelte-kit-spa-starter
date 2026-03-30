# Form Actions Reference (Server Only — NOT in SPA)

## SPA Alternative: Direct Fetch

```svelte
<script>
	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const res = await fetch('https://api.example.com/posts', {
			method: 'POST',
			body: JSON.stringify(Object.fromEntries(formData)),
			headers: { 'Content-Type': 'application/json' }
		});
		if (res.ok) goto('/posts');
	}
</script>

<form onsubmit={handleSubmit}>
	<input name="title" />
	<button>Create</button>
</form>
```

## Server Form Actions (when SSR is available)

```ts
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	create: async ({ request, cookies }) => {
		const data = await request.formData();
		const title = data.get('title');

		if (!title) return fail(400, { title, missing: true });

		await db.posts.create({ data: { title } });
		redirect(303, '/posts');
	}
};
```

```svelte
<form method="POST" action="?/create" use:enhance>
	<input name="title" value={form?.title ?? ''} />
	{#if form?.missing}<p>Title required</p>{/if}
	<button>Create</button>
</form>
```

## use:enhance Custom Behavior

```svelte
<form method="POST" action="?/create" use:enhance={() => {
  // Before submit
  return async ({ result, update }) => {
    if (result.type === 'success') {
      await update(); // default behavior
    } else if (result.type === 'redirect') {
      goto(result.location);
    }
  };
}}>
```
