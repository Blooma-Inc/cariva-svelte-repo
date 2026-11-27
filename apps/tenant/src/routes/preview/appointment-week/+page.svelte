<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import WeekView from '$lib/components/appointments/appointment-week-view.svelte';
	import { appointmentWeek } from '$lib/utils/appointment-calendar';
	const timezone = 'Africa/Lagos';
	let date = $state(new CalendarDate(2026, 11, 27));
	let previewState = $state('appointments');
	let notice = $state('Local preview data. No patient records are changed.');
	const week = $derived(appointmentWeek(date, timezone));
	function example(
		uid: string,
		day: number,
		hour: number,
		minutes: number,
		name: string,
		status: AppointmentStatus = 'booked'
	): AppointmentListItem {
		const starts = week.days[day].toDate(timezone).getTime() + hour * 3600000;
		return {
			uid,
			starts_at: new Date(starts).toISOString(),
			ends_at: new Date(starts + minutes * 60000).toISOString(),
			created_at: new Date(starts).toISOString(),
			updated_at: new Date(starts).toISOString(),
			branch_uid: 'demo-branch',
			tenant_uid: 'demo-tenant',
			patient_uid: uid,
			practitioner_uid: 'demo-practitioner',
			branch_healthcare_service_uid: 'demo-service',
			patient_tenant_link_uid: uid,
			status,
			patient: { uid, display_name: name, patient_no: 'DEMO-001' },
			practitioner: { uid: 'demo-practitioner', display_name: 'Dr. Example' },
			service: {
				branch_healthcare_service_uid: 'demo-service',
				healthcare_service_uid: 'demo-catalogue',
				name: 'Therapy'
			},
			allowed_actions: []
		};
	}
	const records = $derived([
		example('a', 0, 9, 60, 'Ada Test'),
		example('b', 0, 9.5, 30, 'Patient Example'),
		example('c', 1, 10, 30, 'Demo Patient', 'arrived'),
		example('d', 2, 11, 90, 'Patient Four', 'checked-in'),
		example('e', 3, 14, 60, 'Patient Five', 'fulfilled'),
		example('f', 4, 9, 30, 'Patient Six', 'cancelled'),
		example('g', 5, 23.5, 90, 'Overnight Example')
	]);
</script>

<svelte:head><title>Appointment week · Cariva</title></svelte:head>
<main class="min-h-screen space-y-5 bg-background p-5 text-foreground sm:p-10">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold">Weekly appointments</h1>
			<p class="text-sm text-muted-foreground">
				{week.start.toString()} – {week.days[6].toString()} · {timezone}
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			{#each ['appointments', 'loading', 'empty', 'error'] as option (option)}<Button
					variant={previewState === option ? 'secondary' : 'outline'}
					onclick={() => (previewState = option)}>{option}</Button
				>{/each}<Button variant="outline" onclick={() => (date = date.subtract({ days: 7 }))}
				>Previous week</Button
			><Button variant="outline" onclick={() => (date = date.add({ days: 7 }))}>Next week</Button>
		</div>
	</div>
	<WeekView
		{date}
		{timezone}
		records={previewState === 'empty' ? [] : records}
		loading={previewState === 'loading'}
		error={previewState === 'error' ? 'This is a preview of a failed request.' : ''}
		filtered={false}
		onretry={() => (previewState = 'appointments')}
		onView={(uid) =>
			(notice = `Selected ${uid}. The application opens the appointment details sheet here.`)}
		onDay={(day) =>
			(notice = `Selected ${day.toString()}. The application opens this day’s list here.`)}
		onClear={() => (previewState = 'appointments')}
	/>
	<p role="status" class="text-sm text-muted-foreground">{notice}</p>
</main>
