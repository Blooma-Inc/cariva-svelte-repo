<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import { useFetchPatient } from '$lib/hooks/patients/use-fetch-patient';
	import { parseError } from '$lib/utils/errorHandler';
	import ErrorState from '$lib/components/error-state.svelte';
	import PatientEncounterWorkspace from '../components/patient-encounter-workspace.svelte';

	const patientUid = $derived(page.params.id ?? '');
	const query = useFetchPatient(() => patientUid);
</script>

<div class="flex min-w-0 flex-col gap-4">
	<div>
		<Button variant="ghost" href={resolve('/(protected)/patients/[id]', { id: patientUid })}
			><ChevronLeftIcon class="size-3" />Patient profile</Button
		>
	</div>
	{#if query.status === 'pending'}
		<div role="status" aria-label="Loading patient"><Skeleton class="h-32 w-full" /></div>
	{:else if query.status === 'error'}
		<ErrorState
			title="Unable to load patient"
			description={parseError(query.error)}
			onretry={query.refetch}
		/>
	{:else if query.data}
		<div>
			<Heading>{query.data.patient.first_name} {query.data.patient.last_name}</Heading><Paragraph
				size="sm"
				muted>{query.data.patient_no}</Paragraph
			>
		</div>
		<PatientEncounterWorkspace {patientUid} />
	{/if}
</div>
