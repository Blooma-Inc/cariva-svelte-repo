<script lang="ts" module>
	interface WardBedsProps {
		branchUid: string;
		ward: WardOverview;
	}
</script>

<script lang="ts">
	import { Card, CardHeader, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { useFetchFacilityBeds } from '$lib/hooks/facility/use-fetch-facility-beds';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';
	import { parseError } from '$lib/utils/errorHandler';
	import EmptyData from '$lib/components/empty-data.svelte';
	import ErrorState from '$lib/components/error-state.svelte';

	let { branchUid, ward }: WardBedsProps = $props();
	const params = $state({ limit: 30, offset: 0 });
	const query = useFetchFacilityBeds(
		() => branchUid,
		() => ({ ...params, ward_uid: ward.uid }),
		() => true
	);
	const pagination = useOffsetPagination(query, params);

	function bedState(bed: BedItem) {
		if (bed.is_occupied) return { label: 'Occupied', color: 'bg-red-500' };
		if (!ward.is_active || !bed.is_active) return { label: 'Inactive', color: 'bg-gray-400' };
		if (bed.status === 'cleaning') return { label: 'Cleaning', color: 'bg-sky-500' };
		if (bed.status === 'maintenance') return { label: 'Maintenance', color: 'bg-amber-500' };
		return { label: bed.is_available ? 'Available' : 'Unavailable', color: 'bg-green-500' };
	}
</script>

<Card class="h-fit min-w-0">
	<CardHeader>
		<Heading level="h3">{ward.name}</Heading>
		<Paragraph size="sm" muted>{ward.location_note ?? 'Location not specified'}</Paragraph>
		{#if !ward.is_active}
			<Paragraph size="sm"
				>New assignments are unavailable until this ward is reactivated.</Paragraph
			>
		{/if}
	</CardHeader>
	<CardContent class="flex flex-col gap-4">
		{#if query.status === 'pending'}
			<div role="status" aria-label="Loading beds" class="flex flex-col gap-3">
				{#each [1, 2, 3] as row (row)}<Skeleton class="h-20 w-full" />{/each}
			</div>
		{:else if query.status === 'error'}
			<ErrorState
				title="Failed to load beds"
				description={parseError(query.error)}
				onretry={query.refetch}
			/>
		{:else if query.data}
			{#if query.data.data.length}
				<ul class="flex max-h-[34rem] flex-col gap-3 overflow-y-auto pr-1">
					{#each query.data.data as bed (bed.uid)}
						{@const state = bedState(bed)}
						<li class="flex items-start gap-3 rounded-lg border p-3">
							<span class="mt-1.5 size-2 shrink-0 rounded-full {state.color}" aria-hidden="true"
							></span>
							<div class="flex min-w-0 flex-1 flex-col gap-2">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<span class="font-medium">{bed.label}</span>
									<Badge variant="secondary">{state.label}</Badge>
								</div>
								<Paragraph size="sm" muted>
									{bed.bed_type.replaceAll('_', ' ')}{bed.room_label ? ` · ${bed.room_label}` : ''}
								</Paragraph>
								{#if bed.status_note}<Paragraph size="sm">{bed.status_note}</Paragraph>{/if}
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<EmptyData
					title="No beds in this ward"
					description="Beds will appear here once they are created."
				/>
			{/if}
			{#if query.data.meta.total > 10}
				<div class="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
					<Paragraph size="sm" muted>
						Page {query.data.meta.page} of {query.data.meta.total_pages} · {query.data.meta.total} beds
					</Paragraph>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Previous page"
							disabled={query.isLoading || query.data.meta.page <= 1}
							onclick={() => pagination.handlePageChange((query.data?.meta.page ?? 1) - 1)}
						>
							<ChevronLeftIcon class="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							aria-label="Next page"
							disabled={query.isLoading || query.data.meta.page >= query.data.meta.total_pages}
							onclick={() => pagination.handlePageChange((query.data?.meta.page ?? 1) + 1)}
						>
							<ChevronRightIcon class="size-4" />
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	</CardContent>
</Card>
