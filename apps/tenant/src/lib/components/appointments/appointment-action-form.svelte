<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { untrack } from 'svelte';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { TextareaField } from '@cariva/ui/components/form-inputs/textarea-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { appointmentActionLabels } from '$lib/utils/appointment-workspace';
	import { useFetchEncounterTypes } from '$lib/hooks/encounters/use-fetch-encounter-types';
	import { parseError } from '$lib/utils/errorHandler';
	let {
		action,
		onSubmit,
		onCancel
	}: {
		action: Exclude<AppointmentAction, 'reschedule'>;
		onSubmit: (payload: object) => Promise<void>;
		onCancel: () => void;
	} = $props();
	const { AppointmentStore } = stores;
	const types = useFetchEncounterTypes(() => action === 'start_encounter');
	const schema = untrack(() =>
		z.object({
			reason:
				action === 'cancel'
					? z.string().trim().min(1, 'Provide a cancellation reason.').max(2000)
					: z.string().trim().max(2000),
			encounter_class: z.enum(['outpatient', 'emergency']),
			encounter_types: z.array(z.string()).max(10)
		})
	);
	const form = superForm(
		{
			reason: '',
			encounter_class: 'outpatient' as 'outpatient' | 'emergency',
			encounter_types: [] as string[]
		},
		{
			SPA: true,
			dataType: 'json',
			validators: zod4Client(schema),
			onUpdated: async ({ form: updated }) => {
				if (!updated.valid || AppointmentStore.actionLoading) return;
				await onSubmit(
					action === 'cancel'
						? { cancellation_reason: updated.data.reason }
						: action === 'mark_no_show'
							? { no_show_reason: updated.data.reason || null }
							: action === 'start_encounter'
								? {
										encounter_class: updated.data.encounter_class,
										encounter_types: updated.data.encounter_types
									}
								: {}
				);
			}
		}
	);
	const { form: data, enhance } = form;
</script>

<form use:enhance class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
	<fieldset
		disabled={AppointmentStore.actionLoading}
		class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
	>
		<h3 class="font-medium">{appointmentActionLabels[action]}</h3>
		{#if action === 'cancel' || action === 'mark_no_show'}<p class="text-sm text-muted-foreground">
				{action === 'cancel'
					? 'Cancel this appointment and record why it was cancelled.'
					: 'Confirm that the patient did not attend this appointment.'}
			</p>
			<FormField {form} name="reason"
				><TextareaField
					label={action === 'cancel' ? 'Cancellation reason' : 'No-show reason (optional)'}
					bind:value={$data.reason}
					maxlength={2000}
				/></FormField
			>
		{:else if action === 'start_encounter'}<p class="text-sm text-muted-foreground">
				Start a linked visit for this checked-in appointment. The appointment will be marked as
				encounter started.
			</p>
			<FormField {form} name="encounter_class"
				><SelectField
					type="single"
					label="Care setting"
					placeholder="Select setting"
					selectables={[
						{ value: 'outpatient', label: 'Outpatient', enable: true },
						{ value: 'emergency', label: 'Emergency', enable: true }
					]}
					bind:value={$data.encounter_class}
				/></FormField
			>{#if types.isSuccess}<FormField {form} name="encounter_types"
					><SelectField
						type="multiple"
						label="Encounter types (optional)"
						placeholder="Select encounter types"
						selectables={types.data.map((item) => ({
							value: item.value,
							label: item.label,
							enable: true
						}))}
						bind:value={$data.encounter_types}
					/></FormField
				>{:else if types.isError}<EmptyState
					compact
					kind="error"
					title="Couldn’t load encounter types"
					description={parseError(types.error)}
					onAction={() => {
						void types.refetch();
					}}
				/>{/if}
		{:else}<p class="text-sm">
				{action === 'arrive'
					? 'Record that this patient has arrived at the branch.'
					: 'Check this arrived patient in for their appointment.'}
			</p>{/if}
	</fieldset>
	<div class="flex shrink-0 justify-end gap-2">
		<Button
			type="button"
			variant="outline"
			disabled={AppointmentStore.actionLoading}
			onclick={onCancel}>Back</Button
		><Button
			type="submit"
			variant={action === 'cancel' || action === 'mark_no_show' ? 'destructive' : 'default'}
			isLoading={AppointmentStore.actionLoading}
			disabled={AppointmentStore.actionLoading}>{appointmentActionLabels[action]}</Button
		>
	</div>
</form>
