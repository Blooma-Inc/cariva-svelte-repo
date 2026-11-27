<script lang="ts">
	import { untrack } from 'svelte';
	import {
		parseAbsolute,
		toCalendarDate,
		today,
		parseDate,
		type CalendarDate
	} from '@internationalized/date';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { FormField, FormControl } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { DateField } from '@cariva/ui/components/date-fields/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { useAppointmentAvailability } from '$lib/hooks/appointments/use-appointment-booking';
	import { appointmentDay, appointmentSlots } from '$lib/utils/appointment-booking';
	import { parseError } from '$lib/utils/errorHandler';
	import { stores } from '$lib/store/index.svelte';
	import AvailableSlots from './available-slots.svelte';
	let {
		record,
		timezone,
		onSubmit,
		onCancel
	}: {
		record: AppointmentDetailItem;
		timezone: string;
		onSubmit: (payload: AppointmentInterval) => Promise<void>;
		onCancel: () => void;
	} = $props();
	const { AppointmentStore } = stores;
	const initial = untrack(() => toCalendarDate(parseAbsolute(record.starts_at, timezone)));
	let date = $state<CalendarDate | undefined>(initial);
	let incomplete = $state(false);
	let selected = $state<(AppointmentInterval & { scope: string }) | null>(null);
	const form = superForm(
		{
			date: initial.toString(),
			duration: untrack(() =>
				Math.round((Date.parse(record.ends_at) - Date.parse(record.starts_at)) / 60000)
			)
		},
		{
			SPA: true,
			dataType: 'json',
			resetForm: false,
			validators: zod4Client(
				z.object({ date: z.iso.date(), duration: z.number().int().min(5).max(480) })
			),
			onUpdated: async ({ form: updated }) => {
				if (!updated.valid || !validSelection || !selected || AppointmentStore.actionLoading)
					return;
				await onSubmit({ starts_at: selected.starts_at, ends_at: selected.ends_at });
				if (AppointmentStore.actionConflict) {
					selected = null;
					await availability.refetch();
				}
			}
		}
	);
	const { form: data, errors, enhance } = form;
	const day = $derived(!incomplete ? appointmentDay($data.date, timezone) : null);
	const scope = $derived(
		JSON.stringify([record.uid, $data.date, $data.duration, incomplete, timezone])
	);
	const params = $derived<AppointmentAvailabilityParams | null>(
		day &&
			record.branch_healthcare_service_uid &&
			Number.isInteger($data.duration) &&
			$data.duration >= 5 &&
			$data.duration <= 480
			? {
					...day,
					practitioner_uid: record.practitioner_uid,
					branch_healthcare_service_uid: record.branch_healthcare_service_uid,
					patient_uid: record.patient_uid,
					exclude_appointment_uid: record.uid
				}
			: null
	);
	const availability = useAppointmentAvailability(
		() => record.branch_uid,
		() => params
	);
	const slots = $derived(
		day && availability.data
			? appointmentSlots(availability.data.intervals, day, $data.duration)
			: []
	);
	const validSelection = $derived(
		!!params &&
			selected?.scope === scope &&
			availability.isSuccess &&
			!availability.isFetching &&
			slots.some(
				(slot) => slot.starts_at === selected?.starts_at && slot.ends_at === selected?.ends_at
			)
	);
	$effect(() => {
		$data.date = date?.toString() ?? '';
	});
	$effect(() => {
		if (selected && selected.scope !== scope) selected = null;
	});
</script>

<form use:enhance class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
	<fieldset
		disabled={AppointmentStore.actionLoading}
		class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
	>
		<h3 class="font-medium">Reschedule appointment</h3>
		<p class="text-sm text-muted-foreground">
			Choose a new time with the same service and practitioner. All times use {timezone}.
		</p>
		{#if !record.branch_healthcare_service_uid}<p role="alert">
				The service on this historical appointment is unavailable. A new service is needed before it
				can be rescheduled.
			</p>{/if}
		<FormField {form} name="date"
			><FormControl
				>{#snippet children({ props })}<DateField
						{...props}
						label="Appointment date"
						value={date}
						onValueChange={(next) => (date = next ? parseDate(next.toString()) : undefined)}
						onEditStateChange={(state) => (incomplete = state.incomplete)}
						minValue={today(timezone)}
						error={$errors.date?.join(' ')}
					/>{/snippet}</FormControl
			></FormField
		>
		<FormField {form} name="duration"
			><InputField
				type="number"
				label="Duration (minutes)"
				min={5}
				max={480}
				step={1}
				bind:value={$data.duration}
			/></FormField
		>
		<AvailableSlots
			{slots}
			{timezone}
			selected={selected?.scope === scope ? selected : null}
			enabled={!!params}
			loading={availability.isPending || availability.isFetching}
			error={availability.isError ? parseError(availability.error) : ''}
			onretry={() => {
				void availability.refetch();
			}}
			onSelect={(slot) => (selected = { ...slot, scope })}
		/>
	</fieldset>
	<div class="flex shrink-0 justify-end gap-2">
		<Button
			type="button"
			variant="outline"
			disabled={AppointmentStore.actionLoading}
			onclick={onCancel}>Back</Button
		><Button
			type="submit"
			disabled={!validSelection || AppointmentStore.actionLoading}
			isLoading={AppointmentStore.actionLoading}>Reschedule</Button
		>
	</div>
</form>
