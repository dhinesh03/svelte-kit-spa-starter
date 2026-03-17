<script lang="ts">
	import type { GridOptions } from 'ag-grid-community';

	import { getUsers, type User } from '$lib/apis/json-placeholder';
	import * as Card from '$lib/components/ui/card/index.js';
	import { initAGgrid } from '$lib/features/ag-grid/index.svelte';

	// ── State ────────────────────────────────────────────────────────────

	let users = $state<User[]>([]);
	let loading = $state(true);
	let error = $state<string | undefined>(undefined);

	// ── Fetch Data ───────────────────────────────────────────────────────

	const { request } = getUsers();
	request
		.then(({ data }) => {
			users = data;
		})
		.catch((e) => {
			error = e.message;
		})
		.finally(() => {
			loading = false;
		});

	// ── Grid Options ─────────────────────────────────────────────────────

	const basicGridOptions: GridOptions<User> = $derived({
		columnDefs: [
			{ field: 'id', headerName: 'ID', width: 80 },
			{ field: 'name', headerName: 'Name', flex: 1 },
			{ field: 'username', headerName: 'Username', flex: 1 },
			{ field: 'email', headerName: 'Email', flex: 1.5 }
		],
		rowData: users,
		domLayout: 'autoHeight',
		rowSelection: { mode: 'singleRow' },
		defaultColDef: {
			sortable: true,
			resizable: true
		}
	});

	interface UserRow {
		name: string;
		email: string;
		company: string;
		city: string;
		phone: string;
		website: string;
	}

	const detailGridOptions: GridOptions<UserRow> = $derived({
		columnDefs: [
			{ field: 'name', headerName: 'Name', filter: 'agTextColumnFilter', flex: 1 },
			{ field: 'email', headerName: 'Email', filter: 'agTextColumnFilter', flex: 1.5 },
			{ field: 'company', headerName: 'Company', filter: 'agTextColumnFilter', flex: 1 },
			{ field: 'city', headerName: 'City', filter: 'agTextColumnFilter', flex: 0.8 },
			{ field: 'phone', headerName: 'Phone', flex: 1 },
			{ field: 'website', headerName: 'Website', flex: 0.8 }
		],
		rowData: users.map((u) => ({
			name: u.name,
			email: u.email,
			company: u.company.name,
			city: u.address.city,
			phone: u.phone,
			website: u.website
		})),
		domLayout: 'autoHeight',
		pagination: true,
		paginationPageSize: 5,
		paginationPageSizeSelector: [5, 10],
		defaultColDef: {
			sortable: true,
			resizable: true,
			filter: true
		}
	});
</script>

<div class="mx-auto max-w-5xl space-y-8 overflow-y-auto p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">AG Grid Showcase</h1>
		<p class="mt-2 text-muted-foreground">
			Data grids powered by <code class="rounded bg-muted px-1.5 py-0.5 text-sm">AG Grid Community</code>
			with the Quartz theme, sorting, filtering, and pagination.
		</p>
	</div>

	{#if loading}
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
			Loading data...
		</div>
	{:else if error}
		<p class="text-sm text-destructive">Failed to load data: {error}</p>
	{:else}
		<!-- Basic Grid -->
		<section class="space-y-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Basic Grid</Card.Title>
					<Card.Description>Simple grid with sorting, resizable columns, and single row selection.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div {@attach initAGgrid(basicGridOptions)}></div>
				</Card.Content>
			</Card.Root>
		</section>

		<!-- Filterable + Paginated Grid -->
		<section class="space-y-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Filterable &amp; Paginated Grid</Card.Title>
					<Card.Description>Grid with column filters, pagination, and sortable headers. Click column headers to filter.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div {@attach initAGgrid(detailGridOptions)}></div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}
</div>
