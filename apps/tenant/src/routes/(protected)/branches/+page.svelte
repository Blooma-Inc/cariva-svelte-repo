<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NoBranches from './components/no-branches.svelte';
	import { useFetchTenantBranches } from '$lib/hooks/tenant/use-fetch-branches';
	import { columns } from './data/branch-columns';
	import { DataTable, DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';

	const { AppStore } = stores;

	const params = $state({
		limit: 30,
		offset: 0
	});
	const query = useFetchTenantBranches(params);
	const { paginationMeta, handlePageChange, handlePerPageChange } = useOffsetPagination(
		query,
		params
	);
</script>

{#snippet EmptyBranch()}
	<NoBranches />
{/snippet}

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading level="h3">Branches</Heading>
		{#if query.status === 'success' && query.data}
			<Paragraph muted
				>{query.data.meta.total} branch(es) across {AppStore.currentTenant?.name}</Paragraph
			>
		{/if}
	</div>

	<div class="flex w-full flex-col gap-2">
		{#if query.status === 'success' && query.data}
			{#if query.data.data.length}
				<div class="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center">
					<DataTableSearch class="w-full! max-w-sm" placeholder="search by name, status e.t.c" />

					<Button
						size="sm"
						onclick={() =>
							AppStore.toggleModals({
								open: true,
								name: AppModals.BRANCH_FORM_MODAL,
								branch_uid: ''
							})}
					>
						<PlusIcon class="size-3" />
						New Branch
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
				title: 'Failed to load branches',
				errorDescription: 'An error occurred while fetching the branch list.',
				onRetry: query.refetch
			}}
			emptyDataNode={EmptyBranch}
		/>
	</div>
</div>
