<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card } from '@cariva/ui/components/ui/card/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ROUTES from '$lib/configs/routes.svelte';
	import { useFetchPatient } from '$lib/hooks/patients/use-fetch-patient';
	import { parseError } from '$lib/utils/errorHandler';
	import ErrorState from '$lib/components/error-state.svelte';
	import PatientProfile from '../components/patient-profile.svelte';

	const patientUid = $derived(page.params.id ?? '');
	const query = useFetchPatient(() => patientUid);
</script>

<div class="flex min-w-0 flex-col gap-4">
	<div>
		<Button variant="ghost" href={ROUTES.PATIENTS.resolve()}
			><ChevronLeftIcon class="size-4" />Patients</Button
		>
	</div>
	{#if query.status === 'pending'}
		<div role="status" aria-label="Loading patient"><Skeleton class="h-48 w-full" /></div>
	{:else if query.status === 'error'}
		<ErrorState
			title="Unable to load patient"
			description={parseError(query.error)}
			onretry={query.refetch}
		/>
	{:else if query.data}
		<Card class="mx-auto w-full max-w-3xl p-5 sm:p-6">
			{#key patientUid}<PatientProfile data={query.data} />{/key}
		</Card>
	{/if}
</div>
