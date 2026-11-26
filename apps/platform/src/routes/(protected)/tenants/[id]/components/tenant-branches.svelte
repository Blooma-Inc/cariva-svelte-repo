<script lang="ts">
	import { useFetchTenantBranches } from '$lib/hooks/tenant/use-fetch-tenant-details';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { DataTableSearch, DataTablePagination } from '@cariva/ui/components/data-table/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import BranchCard from './branch-card.svelte';
	import SectionError from './section-error.svelte';
	let { tenantUid }: { tenantUid: string } = $props();
	const { PermissionStore } = stores;
	const canRead = $derived(PermissionStore.can(PERMISSIONS.TENANTS_READ));
	let search = $state('');
	const debouncedSearch = useDebounce(() => search.trim());
	const params = $state<CarivaBaseQueryParams>({ limit: 10, offset: 0, q: '' });
	$effect(() => {
		params.q = debouncedSearch.value;
		params.offset = 0;
	});
	const query = useFetchTenantBranches(
		() => tenantUid,
		() => canRead,
		() => params
	);
	const pagination = $derived(query.data?.meta);
	const branches = $derived(query.data?.data ?? []);
	const changePage = (page: number) => {
		if (canRead && !query.isFetching) params.offset = (page - 1) * params.limit;
	};
	const changePageSize = (limit: number) => {
		if (!canRead || query.isFetching) return;
		params.limit = limit;
		params.offset = 0;
	};
</script>

<Card class="min-w-0 border bg-primary/5" aria-label="Tenant branches" aria-busy={query.isPending}>
	<CardHeader class="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-2">
			<CardTitle>Branch List</CardTitle>
			{#if query.isPending}<Skeleton class="h-5 w-7 rounded-xl" />{:else if pagination}<Badge
					variant="info">{pagination.total}</Badge
				>{/if}
		</div>
		<DataTableSearch
			bind:value={search}
			aria-label="Search branches by name"
			placeholder="Search branches by name"
			disabled={!canRead}
		/>
	</CardHeader>
	<CardContent class="flex flex-col gap-3">
		{#if query.isError}
			<SectionError
				message="Couldn't load tenant branches."
				retry={() => {
					if (canRead) return query.refetch();
				}}
			/>
		{:else if query.isPending || branches.length}
			<div class="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
				{#if query.isPending}
					{#each Array.from({ length: params.limit }, (_, index) => index) as card (card)}<BranchCard
							loading
						/>{/each}
				{:else}
					{#each branches as branch (branch.uid)}<BranchCard {branch} />{/each}
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
				<Paragraph size="sm"
					>{params.q
						? 'No branches match your search.'
						: 'No branches have been created for this tenant.'}</Paragraph
				>
			</div>
		{/if}

		{#if pagination && !query.isError}
			<div class="overflow-x-auto">
				<DataTablePagination
					meta={{
						type: 'offset',
						total: pagination.total,
						page: pagination.page,
						perPage: pagination.per_page,
						totalPages: pagination.total_pages
					}}
					isLoading={query.isFetching}
					onPageChange={changePage}
					onPerPageChange={changePageSize}
				/>
			</div>
		{/if}
		{#if params.q && !query.isPending && !query.isError && !branches.length}
			<Button
				variant="secondary"
				class="w-fit"
				onclick={() => {
					search = '';
				}}>Clear search</Button
			>
		{/if}
	</CardContent>
</Card>
