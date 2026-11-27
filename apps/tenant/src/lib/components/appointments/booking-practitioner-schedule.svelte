<script lang="ts">
	import { untrack } from 'svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import AvailabilitySummary from '$lib/components/scheduling/availability-summary.svelte';
	import { useFetchPractitionerAvailability } from '$lib/hooks/practitioner-availability/use-fetch-practitioner-availability';
	import { parseError } from '$lib/utils/errorHandler';
	let {
		branchUid,
		practitionerUid,
		assignmentUid,
		serviceUid,
		timezone
	}: {
		branchUid: string;
		practitionerUid: string;
		assignmentUid: string;
		serviceUid: string;
		timezone: string;
	} = $props();
	const params = untrack(() => ({ practitioner_uid: practitionerUid, limit: 100, offset: 0 }));
	const query = useFetchPractitionerAvailability(() => branchUid, params, true, true);
	const records = $derived(
		(query.data?.data ?? []).filter((item) => item.assignment_uid === assignmentUid)
	);
	const general = $derived(records.find((item) => item.branch_healthcare_service_uid === null));
	const specific = $derived(
		records.find((item) => item.branch_healthcare_service_uid === serviceUid)
	);
</script>

<Card aria-label="Practitioner schedule" aria-busy={query.isFetching}>
	<CardHeader class="px-4 pt-4 pb-0"
		><CardTitle class="text-sm">Practitioner schedule</CardTitle></CardHeader
	>
	<CardContent class="flex flex-col gap-4 px-4 pb-4">
		{#if query.isPending || query.isFetching}
			<Skeleton class="h-4 w-40" /><Skeleton class="h-20 w-full" /><Skeleton class="h-20 w-full" />
		{:else if query.isError}
			<p role="alert" class="text-sm">{parseError(query.error)}</p>
			<Button type="button" variant="outline" onclick={() => query.refetch()}
				>Retry practitioner schedule</Button
			>
		{:else}
			<section class="flex flex-col gap-3" aria-label="General working hours">
				<div class="flex items-center justify-between gap-2">
					<h4 class="text-sm font-medium">General working hours</h4>
					{#if general}<Badge variant={general.is_effectively_active ? 'default' : 'secondary'}
							>{general.is_effectively_active ? 'Active' : 'Inactive'}</Badge
						>{/if}
				</div>
				<AvailabilitySummary
					availability={general?.availability ?? null}
					timezone={general?.timezone || timezone}
					kind="practitioner"
				/>
			</section>
			<section
				class="flex flex-col gap-3 border-t pt-4"
				aria-label="Service-specific working hours"
			>
				<div class="flex items-center justify-between gap-2">
					<h4 class="text-sm font-medium">Service-specific working hours</h4>
					{#if specific}<Badge variant={specific.is_effectively_active ? 'default' : 'secondary'}
							>{specific.is_effectively_active ? 'Active' : 'Inactive'}</Badge
						>{/if}
				</div>
				{#if specific}<AvailabilitySummary
						availability={specific.availability}
						timezone={specific.timezone || timezone}
						kind="practitioner"
					/>
				{:else}<p class="text-sm text-muted-foreground">
						No separate schedule for this service. General working hours apply alongside branch and
						service hours.
					</p>{/if}
			</section>
		{/if}
	</CardContent>
</Card>
