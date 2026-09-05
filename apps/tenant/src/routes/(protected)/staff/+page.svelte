<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NoStaff from './components/no-staff.svelte';
	import { useFetchAllStaff } from '$lib/hooks/staff/use-fetch-all-staff';
	import { columns } from './data/staff-columns';
	import {
		DataTable,
		DataTableSearch,
		type PaginationMeta
	} from '@cariva/ui/components/data-table/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ListFilterIcon from '@lucide/svelte/icons/list-filter';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';

	const { AppStore } = stores;

	const params = $state({
		limit: 30,
		offset: 0
	});

	const query = useFetchAllStaff(params);
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

{#snippet EmptyStaff()}
	<NoStaff />
{/snippet}

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Staff</Heading>
		<Paragraph size="sm" muted
			>Manage Staff, and their operational access across the platform.</Paragraph
		>
	</div>

	<div class="flex w-full flex-col gap-2">
		{#if query.status === 'success' && query.data}
			{#if query.data.data.length}
				<div class="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center">
					<div class="flex items-center justify-start gap-2">
						<DataTableSearch class="w-full! max-w-sm" placeholder="search staff" />
						<Button size="icon" variant="outline">
							<ListFilterIcon class="size-3" />
						</Button>
					</div>

					<Button
						onclick={() =>
							AppStore.toggleModals({
								open: true,
								name: AppModals.STAFF_FORM_MODAL,
								user_uid: ''
							})}
					>
						<PlusIcon class="size-3" />
						New Staff
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
				title: 'Failed to load staff',
				errorDescription: 'An error occurred while fetching the staff list.',
				onRetry: query.refetch
			}}
			emptyDataNode={EmptyStaff}
		/>
	</div>
</div>
