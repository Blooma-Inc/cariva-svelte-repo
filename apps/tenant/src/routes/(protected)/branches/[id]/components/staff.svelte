<script lang="ts" module>
	interface BranchStaffProps {
		branchUid: string;
		branchName: string;
	}
</script>

<script lang="ts">
	import { Card, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ListFilterIcon from '@lucide/svelte/icons/list-filter';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { columns } from '$routes/(protected)/staff/data/staff-columns';
	import { DataTable, DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useFetchBranchStaff } from '$lib/hooks/staff/use-fetch-branch-staff';
	import NoStaff from '$routes/(protected)/staff/components/no-staff.svelte';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';

	let { branchUid, branchName }: BranchStaffProps = $props();
	const { AppStore } = stores;

	const params = $state({
		limit: 30,
		offset: 0
	});

	const query = useFetchBranchStaff(() => branchUid, params);
	const { paginationMeta, handlePageChange, handlePerPageChange } = useOffsetPagination(
		query,
		params
	);
</script>

{#snippet EmptyStaff()}
	<NoStaff />
{/snippet}

<section class="flex w-full min-w-0 flex-col gap-4">
	<Card class="relative overflow-hidden bg-primary text-white!">
		<CardHeader>
			<div class="flex justify-start gap-2">
				<div class="rounded-lg bg-white/25 p-3">
					<UsersIcon class="size-5" />
				</div>
				<div>
					<Heading level="h1">Staff</Heading>
					<Paragraph
						>{branchName}
						{query.status === 'success' &&
							query.data &&
							`has ${query.data.meta.total} total staffs`}</Paragraph
					>
				</div>
			</div>
		</CardHeader>
	</Card>

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
</section>
