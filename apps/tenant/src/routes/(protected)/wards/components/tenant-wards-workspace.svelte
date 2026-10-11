<script lang="ts">
	import {
		Select,
		SelectTrigger,
		SelectContent,
		SelectItem
	} from '@cariva/ui/components/ui/select/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { useFetchFacilityBranches } from '$lib/hooks/facility/use-fetch-facility-branches';
	import { parseError } from '$lib/utils/errorHandler';
	import EmptyData from '$lib/components/empty-data.svelte';
	import ErrorState from '$lib/components/error-state.svelte';
	import WardsAndBeds from '$lib/components/facility/wards-and-beds.svelte';

	const query = useFetchFacilityBranches();
	let selectedBranchUid = $state('');
	const branches = $derived([
		...new Map(
			query.data?.pages.flatMap((page) => page.data).map((branch) => [branch.uid, branch])
		).values()
	]);
	const selectedBranch = $derived(
		branches.find((branch) => branch.uid === selectedBranchUid) ?? branches[0]
	);
</script>

<div class="flex min-w-0 flex-col gap-4">
	{#if query.status === 'pending'}
		<div role="status" aria-label="Loading branches"><Skeleton class="h-11 w-full max-w-sm" /></div>
	{:else if !query.data && query.status === 'error'}
		<ErrorState
			title="Failed to load branches"
			description={parseError(query.error)}
			onretry={query.refetch}
		/>
	{:else if selectedBranch}
		<div class="flex flex-wrap items-end gap-3">
			<div class="flex w-full max-w-sm flex-col gap-2">
				<label for="ward-branch" class="text-sm font-medium">Branch</label>
				<Select
					type="single"
					value={selectedBranch.uid}
					onValueChange={(value) => (selectedBranchUid = value)}
				>
					<SelectTrigger id="ward-branch" aria-label="Branch" floatingLabel={false}>
						<span class="truncate"
							>{selectedBranch.name}{selectedBranch.is_active ? '' : ' (Inactive)'}</span
						>
					</SelectTrigger>
					<SelectContent>
						{#each branches as branch (branch.uid)}
							<SelectItem value={branch.uid} label={branch.name}>
								{branch.name}{branch.is_active ? '' : ' (Inactive)'}
							</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>
			{#if query.hasNextPage}
				<Button
					variant="outline"
					aria-label="Load more branches"
					disabled={query.isFetching}
					onclick={() => query.fetchNextPage()}
				>
					{query.isFetchingNextPage ? 'Loading branches…' : 'Load more branches'}
				</Button>
			{/if}
		</div>
		{#if query.status === 'error'}
			<ErrorState
				title="Failed to refresh branches"
				description={parseError(query.error)}
				onretry={() => (query.hasNextPage ? query.fetchNextPage() : query.refetch())}
			/>
		{/if}
		{#key selectedBranch.uid}
			<WardsAndBeds branchUid={selectedBranch.uid} branchName={selectedBranch.name} />
		{/key}
	{:else}
		<EmptyData
			title="No branches yet"
			description="Create a branch before managing wards and beds."
		/>
	{/if}
</div>
