<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '@cariva/ui/components/ui/card/index.js';
	import BookAppointment from '$lib/components/appointments/book-appointment.svelte';
	import { appointmentBranch, canBookAppointments } from '$lib/utils/appointment-booking';
	import { stores } from '$lib/store/index.svelte';
	const context = $derived(appointmentBranch(stores));
	const allowed = $derived(canBookAppointments(stores, context?.branch_uid ?? ''));
</script>

<svelte:head><title>Appointments · Cariva</title></svelte:head>
<div class="flex min-w-0 flex-col gap-6">
	<div>
		<Heading level="h3">Appointments</Heading><Paragraph muted
			>{context?.branch_name ?? 'Branch appointment booking'}</Paragraph
		>
	</div>
	{#if !context}<Paragraph>Sign in with an active branch assignment to book appointments.</Paragraph
		>
	{:else if !allowed}<Paragraph
			>You need permission to create appointments and view patients, branch services, practitioner
			schedules, and availability.</Paragraph
		>
	{:else}<Card>
			<CardHeader
				><CardTitle>Book a patient visit</CardTitle><CardDescription
					>Find an available time for a service and practitioner in your branch, then select the
					patient and confirm the appointment.</CardDescription
				></CardHeader
			>
			<CardContent class="flex flex-col items-start gap-4"
				><Paragraph size="sm" muted
					>Availability accounts for configured hours, exceptions, and existing appointments. We
					check the selected time again before booking.</Paragraph
				><BookAppointment /></CardContent
			>
		</Card>{/if}
</div>
