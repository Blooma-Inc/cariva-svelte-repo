<script lang="ts">
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import Workspace from '$lib/components/appointments/appointment-workspace.svelte';
	import { appointmentBranch, canReadAppointments } from '$lib/utils/appointment-booking';
	import { stores } from '$lib/store/index.svelte';
	const context = $derived(appointmentBranch(stores));
	const allowed = $derived(canReadAppointments(stores, context?.branch_uid ?? ''));
</script>

<svelte:head><title>Appointments · Cariva</title></svelte:head>
{#if context && allowed}{#key `${stores.AppStore.currentTenant.uid}:${context.branch_uid}`}<Workspace
			{context}
		/>{/key}
{:else}<Paragraph
		>Sign in with an active branch assignment and appointment read access to view appointments.</Paragraph
	>{/if}
