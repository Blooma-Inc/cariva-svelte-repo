<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NoTenants from './components/no-tenants.svelte';
	import { useFetchTenants } from '$lib/hooks/platform/useFetchTenants.svelte';
	import { columns } from './data/tenant-columns';
	import { DataTable, type PaginationMeta } from '@cariva/ui/components/data-table/index.js';

	const params = $state({
		limit: 10,
		offset: 0
	});

	const query = useFetchTenants(params);
	const paginationMeta = $derived.by<PaginationMeta>(() => {
		if (query.status === 'success' && query.data) {
			const meta = query.data.meta;
			return {
				type: 'offset',
				total: meta.total,
				page: meta.page,
				perPage: meta.per_page,
				totalPages: meta.total_pages
			};
		}
		return {
			type: 'offset',
			total: 0,
			page: 1,
			perPage: params.limit,
			totalPages: 1
		};
	});

	function handlePageChange(page: number) {
		params.offset = (page - 1) * params.limit;
	}

	function handlePerPageChange(perPage: number) {
		params.limit = perPage;
		params.offset = 0;
	}
</script>

{#snippet EmptyTenant()}
	<NoTenants />
{/snippet}

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Tenants</Heading>
		<Paragraph size="sm" muted
			>Manage hospitals, subscriptions, and operational access across the platform.</Paragraph
		>
	</div>

	<DataTable
		limit={params.limit}
		status={query.status}
		{columns}
		data={query.data?.data ?? []}
		paginationProps={{
			meta: paginationMeta,
			isLoading: query.isLoading,
			onPageChange: handlePageChange,
			onPerPageChange: handlePerPageChange
		}}
		errorDataProps={{
			title: 'Failed to load tenants',
			errorDescription: 'An error occurred while fetching the tenant list.',
			onRetry: query.refetch
		}}
		emptyDataNode={EmptyTenant}
	/>
</div>
