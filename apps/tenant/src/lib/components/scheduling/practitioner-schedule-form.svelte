<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { CheckField } from '@cariva/ui/components/form-inputs/check-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { stores } from '$lib/store/index.svelte';
	import {
		scheduleDefaults,
		scheduleFormSchema,
		schedulePayload,
		scheduleChanges
	} from '$lib/validators/service-availability';
	import {
		canActivatePractitionerSchedule,
		canWritePractitionerSchedule
	} from '$lib/utils/practitioner-availability-access';
	import AvailabilityFields from './availability-fields.svelte';

	let {
		context,
		record,
		offeringUid,
		onSuccess
	}: {
		context: PractitionerScheduleContext;
		record?: PractitionerAvailabilityItem;
		offeringUid: string | null;
		onSuccess: () => void;
	} = $props();
	const { PractitionerAvailabilityStore: serviceStore } = stores;
	const timezone = untrack(() => record?.timezone ?? context.timezone);
	const canWrite = $derived(
		canWritePractitionerSchedule(stores, context.branch_uid, context.practitioner_uid, !record) &&
			(record
				? record.assignment_is_active && record.assignment_uid === context.assignment_uid
				: context.assignment_is_active && context.practitioner_is_active)
	);
	const canActivate = $derived(
		record
			? canActivatePractitionerSchedule(record)
			: context.branch_is_active && context.assignment_is_active && context.practitioner_is_active
	);
	const initial = untrack(() =>
		scheduleDefaults(
			record?.availability ?? null,
			timezone,
			record?.is_active ?? context.branch_is_active,
			record?.branch_healthcare_service_uid ?? offeringUid ?? 'general'
		)
	);
	const form = superForm(initial, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(scheduleFormSchema(timezone)),
		onUpdated: async ({ form: updated }) => {
			if (!updated.valid || !canWrite) return;
			const current = schedulePayload(updated.data, timezone);
			const payload = record
				? scheduleChanges(schedulePayload(initial, timezone), current)
				: {
						...current,
						practitioner_uid: context.practitioner_uid,
						branch_healthcare_service_uid: offeringUid
					};
			if (!Object.keys(payload).length) return;
			await serviceStore.save(context, payload, record, onSuccess);
		}
	});
	const { form: data, enhance, reset } = form;
	const changed = $derived(JSON.stringify(initial) !== JSON.stringify($data));
</script>

<form use:enhance class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
	<fieldset
		disabled={!canWrite || serviceStore.loading}
		class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden"
	>
		<div class="shrink-0">
			<FormField {form} name="is_active"
				><CheckField
					label="Schedule active"
					disabled={!canActivate && !$data.is_active}
					bind:checked={$data.is_active}
				/></FormField
			>
		</div>
		<div
			class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
			role="region"
			aria-label="Availability"
		>
			<AvailabilityFields
				{form}
				{timezone}
				kind="practitioner"
				disabled={!canWrite || serviceStore.loading}
			/>
		</div>
	</fieldset>
	{#if serviceStore.error}<p role="alert" class="shrink-0 text-sm text-destructive">
			{serviceStore.error}
		</p>{/if}
	{#if !canWrite}<p role="alert" class="shrink-0">
			You do not have permission to edit this schedule, or its branch assignment is no longer
			active.
		</p>{/if}
	<div class="flex shrink-0 justify-end gap-2">
		<Button
			type="button"
			variant="outline"
			disabled={serviceStore.loading || !changed}
			onclick={() => {
				reset({ data: structuredClone(initial) });
				serviceStore.error = '';
			}}>Reset changes</Button
		>
		<Button
			type="submit"
			isLoading={serviceStore.loading}
			disabled={!canWrite || serviceStore.loading || (Boolean(record) && !changed)}
			>{record ? 'Save schedule' : 'Create schedule'}</Button
		>
	</div>
</form>
