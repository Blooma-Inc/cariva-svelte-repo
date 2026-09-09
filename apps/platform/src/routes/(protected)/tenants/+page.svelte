<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NoTenants from './components/no-tenants.svelte';
	import { useFetchTenants } from '$lib/hooks/tenant/use-fetch-tenants.svelte';
	import { columns } from './data/tenant-columns';
	import { DataTable, DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';

	const { AppStore } = stores;

	const params = $state({
		limit: 10,
		offset: 0
	});

	const query = useFetchTenants(params);
	const { paginationMeta, handlePageChange, handlePerPageChange } = useOffsetPagination(
		query,
		params
	);
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

	<div class="flex w-full flex-col gap-2">
		{#if query.status === 'success' && query.data}
			{#if query.data.data.length}
				<div class="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center">
					<DataTableSearch placeholder="search by name, status e.t.c" />

					<Button
						size="sm"
						onclick={() =>
							AppStore.toggleModals({
								open: true,
								name: AppModals.TENANT_FORM_MODAL,
								tenant_uid: ''
							})}
					>
						<PlusIcon class="size-3" />
						Provision Tenant
					</Button>
				</div>
			{/if}
		{/if}

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
</div>
