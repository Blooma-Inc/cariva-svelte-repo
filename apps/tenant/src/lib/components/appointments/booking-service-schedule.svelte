<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';

	import AvailabilitySummary from '$lib/components/scheduling/availability-summary.svelte';
	import { useFetchBranchHealthcareService } from '$lib/hooks/branch-healthcare-services/use-fetch-branch-healthcare-services';
	import { parseError } from '$lib/utils/errorHandler';
	let { branchUid, serviceUid }: { branchUid: string; serviceUid: string } = $props();
	const query = useFetchBranchHealthcareService(
		() => branchUid,
		() => serviceUid
	);
</script>

<Card aria-label="Service schedule" aria-busy={query.isFetching}>
	<CardHeader class="px-4 pt-4 pb-0"
		><CardTitle class="text-sm">Service schedule</CardTitle></CardHeader
	>
	<CardContent class="flex flex-col gap-3 px-4 pb-4">
		{#if query.isPending || query.isFetching}
			<Skeleton class="h-4 w-40" /><Skeleton class="h-20 w-full" /><Skeleton class="h-20 w-full" />
		{:else if query.isError}
			<EmptyState
				compact
				kind="error"
				title="Couldn’t load service schedule"
				description={parseError(query.error)}
				onAction={() => {
					void query.refetch();
				}}
			/>
		{:else if query.data}
			<div class="flex items-center justify-between gap-2">
				<p class="text-sm font-medium">{query.data.name}</p>
				<Badge variant={query.data.is_effectively_active ? 'default' : 'secondary'}
					>{query.data.is_effectively_active ? 'Active' : 'Inactive'}</Badge
				>
			</div>
			<AvailabilitySummary availability={query.data.availability} timezone={query.data.timezone} />
		{/if}
	</CardContent>
</Card>
