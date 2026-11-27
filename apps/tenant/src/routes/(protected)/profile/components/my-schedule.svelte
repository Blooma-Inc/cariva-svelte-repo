<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { useFetchUserProfile } from '$lib/hooks/user/use-fetch-profile';
	import { parseError } from '$lib/utils/errorHandler';
	import PractitionerScheduleCard from '$lib/components/scheduling/practitioner-schedule-card.svelte';
	const query = useFetchUserProfile();
</script>

{#if query.status === 'success' && query.data}
	{#key query.data.uid}<PractitionerScheduleCard practitioner={query.data} personal />{/key}
{:else}
	<Card>
		<CardHeader><CardTitle>My Schedule</CardTitle></CardHeader>
		<CardContent class="flex flex-col gap-3">
			{#if query.status === 'pending'}<div
					aria-label="Loading schedule profile"
					aria-busy="true"
					class="flex flex-col gap-3"
				>
					<Skeleton class="h-12 w-full" /><Skeleton class="h-24 w-full" /><Skeleton
						class="h-24 w-full"
					/>
				</div>
			{:else if query.status === 'error'}<p role="alert">{parseError(query.error)}</p>
				<Button variant="outline" onclick={() => query.refetch()}>Retry profile</Button>{/if}
		</CardContent>
	</Card>
{/if}
