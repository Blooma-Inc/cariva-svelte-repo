<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NoBranches from './components/no-branches.svelte';
	import { useFetchTenantBranches } from '$lib/hooks/tenant/use-fetch-branches';
	import { columns } from './data/branch-columns';
	import {
		DataTable,
		DataTableSearch,
		type PaginationMeta
	} from '@cariva/ui/components/data-table/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';

	const { AppStore } = stores;

	const params = $state({
		limit: 30,
		offset: 0
	});

	const query = useFetchTenantBranches(params);
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

{#snippet EmptyBranch()}
	<NoBranches />
{/snippet}

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Branches</Heading>
		<Paragraph size="sm" muted
			>Manage hospitals, subscriptions, and operational access across the platform.</Paragraph
		>
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
