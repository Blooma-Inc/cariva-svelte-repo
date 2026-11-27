<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card } from '@cariva/ui/components/ui/card/index.js';
	import Clock from '@lucide/svelte/icons/clock';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Stethoscope from '@lucide/svelte/icons/stethoscope';
	import Eye from '@lucide/svelte/icons/eye';
	import { stores } from '$lib/store/index.svelte';
	import {
		canPerformAppointment,
		appointmentActionLabels,
		appointmentClock,
		appointmentDateLabel
	} from '$lib/utils/appointment-workspace';
	import Status from './appointment-status.svelte';
	let {
		appointment,
		timezone,
		onView,
		onAction
	}: {
		appointment: AppointmentListItem;
		timezone: string;
		onView: () => void;
		onAction: (action: AppointmentAction) => void;
	} = $props();
	const quick = $derived(
		appointment.allowed_actions.find(
			(action) =>
				['arrive', 'check_in'].includes(action) &&
				canPerformAppointment(stores, appointment.branch_uid, appointment, action)
		)
	);
</script>

<Card class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
	<div class="shrink-0 space-y-1 text-sm sm:w-32">
		<p class="font-medium">
			{appointmentClock(appointment.starts_at, timezone)} – {appointmentClock(
				appointment.ends_at,
				timezone
			)}
		</p>
		{#if appointmentDateLabel(appointment.starts_at, timezone) !== appointmentDateLabel(appointment.ends_at, timezone)}<p
				class="text-xs text-muted-foreground"
			>
				Ends {appointmentDateLabel(appointment.ends_at, timezone)}
			</p>{/if}
	</div>
	<div class="min-w-0 flex-1 space-y-2 sm:border-l sm:pl-4">
		<div>
			<Button
				type="button"
				variant="link"
				class="h-auto max-w-full justify-start p-0 text-left font-semibold"
				onclick={onView}
				>{appointment.patient?.display_name ?? 'Patient details unavailable'}</Button
			>
			<p class="text-xs text-muted-foreground">
				{appointment.patient?.patient_no ?? 'Patient number unavailable'}
			</p>
		</div>
		<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
			<span class="flex items-center gap-1"
				><Stethoscope class="size-3" />{appointment.service?.name ?? 'Service unavailable'}</span
			><span class="flex items-center gap-1"
				><UserRound class="size-3" />{appointment.practitioner?.display_name ??
					'Practitioner unavailable'}</span
			>
		</div>
		{#if appointment.checked_in_at}<p class="flex items-center gap-1 text-xs text-primary">
				<Clock class="size-3" />Checked in {appointmentClock(appointment.checked_in_at, timezone)}
			</p>{:else if appointment.arrived_at}<p class="text-xs text-primary">
				Arrived {appointmentClock(appointment.arrived_at, timezone)}
			</p>{/if}
	</div>
	<div class="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
		<Status status={appointment.status} />
		<div class="flex gap-2">
			{#if quick}<Button
					type="button"
					size="sm"
					disabled={stores.AppointmentStore.actionLoading}
					onclick={() => onAction(quick)}>{appointmentActionLabels[quick]}</Button
				>{/if}<Button type="button" size="sm" variant="outline" onclick={onView}
				><Eye class="size-3" />View</Button
			>
		</div>
	</div>
</Card>
