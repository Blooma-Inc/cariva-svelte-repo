<script lang="ts" module>
	interface WardBedsProps {
		branchUid: string;
		ward: WardOverview;
	}
</script>

<script lang="ts">
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { useFetchFacilityBeds } from '$lib/hooks/facility/use-fetch-facility-beds';
	import { parseError } from '$lib/utils/errorHandler';
	import EmptyData from '$lib/components/empty-data.svelte';
	import ErrorState from '$lib/components/error-state.svelte';

	let { branchUid, ward }: WardBedsProps = $props();
	const query = useFetchFacilityBeds(
		() => branchUid,
		() => ward.uid
	);
	const beds = $derived(
		[
			...new Map(
				query.data?.pages.flatMap((page) => page.data).map((bed) => [bed.uid, bed])
			).values()
		].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
	);

	function bedState(bed: BedItem) {
		if (bed.is_occupied) return { label: 'Occupied', color: 'bg-red-500' };
		if (!ward.is_active || !bed.is_active) return { label: 'Inactive', color: 'bg-gray-400' };
		if (bed.status === 'cleaning') return { label: 'Cleaning', color: 'bg-sky-500' };
		if (bed.status === 'maintenance') return { label: 'Maintenance', color: 'bg-amber-500' };
		if (bed.is_available) return { label: 'Available', color: 'bg-green-500' };
		return { label: 'Unavailable', color: 'bg-gray-400' };
	}
</script>

<div class="flex min-w-0 flex-col gap-3">
	{#if !ward.is_active}
		<Paragraph size="sm">New assignments are unavailable until this ward is reactivated.</Paragraph>
	{/if}
	{#if query.status === 'pending'}
		<div role="status" aria-label="Loading beds" class="flex flex-wrap gap-3">
			{#each [1, 2, 3, 4, 5, 6] as tile (tile)}<Skeleton class="size-9" />{/each}
		</div>
	{:else if !query.data && query.status === 'error'}
		<ErrorState
			title="Failed to load beds"
			description={parseError(query.error)}
			onretry={query.refetch}
		/>
	{:else if beds.length}
		<ul
			aria-label={`Beds in ${ward.name}`}
			class="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-3"
		>
			{#each beds as bed (bed.uid)}
				{@const state = bedState(bed)}
				<li
					aria-label={`${bed.label}: ${state.label}`}
					title={`${bed.label}: ${state.label}${bed.room_label ? ` · ${bed.room_label}` : ''}${bed.status_note ? ` · ${bed.status_note}` : ''}`}
					class="flex h-9 min-w-0 items-center justify-center rounded-md px-1 text-sm text-white {state.color}"
				>
					<span class="truncate">{bed.label.replace(/^bed\s*/i, '')}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<EmptyData
			title="No beds in this ward"
			description="Beds will appear here once they are created."
		/>
	{/if}
	{#if query.data && query.status === 'error'}
		<Paragraph size="sm">{parseError(query.error)}</Paragraph>
	{/if}
	{#if query.hasNextPage}
		<Button
			variant="outline"
			class="w-fit"
			aria-label={`Load more beds in ${ward.name}`}
			disabled={query.isFetching}
			onclick={() => query.fetchNextPage()}
		>
			{query.isFetchingNextPage ? 'Loading beds…' : 'Load more beds'}
		</Button>
	{:else if query.data && query.status === 'error'}
		<Button variant="outline" class="w-fit" onclick={() => query.refetch()}>Retry beds</Button>
	{/if}
</div>
