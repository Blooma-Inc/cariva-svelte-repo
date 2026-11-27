<script lang="ts">
	import { untrack } from 'svelte';
	import ScheduleTemporalField from './schedule-temporal-field.svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { ScheduleFormData } from '$lib/validators/service-availability';
	import { SERVICE_WEEKDAYS } from '$lib/validators/service-availability';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { CheckField } from '@cariva/ui/components/form-inputs/check-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';

	let {
		form,
		timezone,
		kind = 'service',
		disabled = false
	}: {
		form: SuperForm<ScheduleFormData>;
		timezone: string;
		kind?: 'service' | 'practitioner';
		disabled?: boolean;
	} = $props();
	const { form: data, errors } = untrack(() => form);
	const weekdays = SERVICE_WEEKDAYS.map((value) => ({
		value,
		label: {
			mon: 'Monday',
			tue: 'Tuesday',
			wed: 'Wednesday',
			thu: 'Thursday',
			fri: 'Friday',
			sat: 'Saturday',
			sun: 'Sunday'
		}[value],
		enable: true
	}));
</script>

<section class="flex flex-col gap-3 rounded-xl border p-3">
	<Heading level="h3">Availability</Heading>
	<Paragraph size="sm" muted
		>Times use {timezone || 'the branch timezone'}. Branch and service hours also limit bookings.</Paragraph
	>
	<FormField {form} name="configure_availability"
		><CheckField
			label={kind === 'service' ? 'Configure service hours' : 'Configure working hours'}
			bind:checked={$data.configure_availability}
		/></FormField
	>
	{#if !$data.configure_availability}
		<Paragraph size="sm" muted
			>Hours are unconfigured. Saving clears any previously saved hours and exceptions; new bookings
			remain blocked until hours are configured.</Paragraph
		>
	{:else}
		<div class="flex items-center justify-between gap-2">
			<Heading level="h3">Weekly windows</Heading>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={() =>
					($data.windows = [
						...$data.windows,
						{
							days: ['mon', 'tue', 'wed', 'thu', 'fri'],
							all_day: false,
							start: '09:00',
							end: '17:00'
						}
					])}>Add window</Button
			>
		</div>
		{#if !$data.windows.length}<Paragraph size="sm" muted
				>No available windows. Saving this configuration makes the service unavailable for new
				bookings.</Paragraph
			>{/if}
		{#each $data.windows as window, index (index)}
			<div class="flex flex-col gap-3 rounded-lg border p-3">
				<div class="flex items-center justify-between gap-2">
					<span class="text-sm font-medium">Window {index + 1}</span>
					<Button
						type="button"
						size="sm"
						variant="destructive"
						aria-label={`Remove window ${index + 1}`}
						onclick={() => ($data.windows = $data.windows.filter((_, i) => i !== index))}
						>Remove</Button
					>
				</div>
				<FormField {form} name={`windows[${index}].days`}
					><SelectField
						type="multiple"
						label="Weekdays"
						placeholder="Select weekdays"
						selectables={weekdays}
						bind:value={$data.windows[index].days}
					/></FormField
				>
				<FormField {form} name={`windows[${index}].all_day`}
					><CheckField label="All day" bind:checked={$data.windows[index].all_day} /></FormField
				>
				{#if !window.all_day}
					<div class="grid gap-3 sm:grid-cols-2">
						<FormField {form} name={`windows[${index}].start`}
							><ScheduleTemporalField
								type="time"
								label="Start time"
								enhanced={kind === 'practitioner'}
								{disabled}
								error={$errors.windows?.[index]?.start?.join(' ')}
								bind:value={$data.windows[index].start}
							/></FormField
						>
						<FormField {form} name={`windows[${index}].end`}
							><ScheduleTemporalField
								type="time"
								label="End time"
								enhanced={kind === 'practitioner'}
								{disabled}
								error={$errors.windows?.[index]?.end?.join(' ')}
								bind:value={$data.windows[index].end}
							/></FormField
						>
					</div>
					{#if window.start && window.end && window.end < window.start}<Paragraph size="sm" muted
							>Ends the next day.</Paragraph
						>{/if}
				{/if}
			</div>
		{/each}
		<div class="flex items-center justify-between gap-2 border-t pt-3">
			<Heading level="h3">Unavailable periods</Heading>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={() =>
					($data.exceptions = [...$data.exceptions, { description: '', start: '', end: '' }])}
				>Add exception</Button
			>
		</div>
		{#if !$data.exceptions.length}<Paragraph size="sm" muted>No dated exceptions.</Paragraph>{/if}
		{#each $data.exceptions as exception, index (index)}
			<div class="flex flex-col gap-3 rounded-lg border p-3">
				<div class="flex items-center justify-between gap-2">
					<span class="text-sm font-medium"
						>{exception.description.trim() || `Exception ${index + 1}`}</span
					>
					<Button
						type="button"
						variant="destructive"
						size="sm"
						aria-label={`Remove exception ${index + 1}`}
						onclick={() => ($data.exceptions = $data.exceptions.filter((_, i) => i !== index))}
						>Remove</Button
					>
				</div>
				<FormField {form} name={`exceptions[${index}].description`}
					><InputField
						label="Description (optional)"
						bind:value={$data.exceptions[index].description}
					/></FormField
				>
				<div class={kind === 'practitioner' ? 'flex flex-col gap-4' : 'grid gap-3 sm:grid-cols-2'}>
					<FormField {form} name={`exceptions[${index}].start`}
						><ScheduleTemporalField
							type="datetime-local"
							label="Starts at"
							enhanced={kind === 'practitioner'}
							{disabled}
							error={$errors.exceptions?.[index]?.start?.join(' ')}
							bind:value={$data.exceptions[index].start}
						/></FormField
					>
					<FormField {form} name={`exceptions[${index}].end`}
						><ScheduleTemporalField
							type="datetime-local"
							label="Ends at"
							enhanced={kind === 'practitioner'}
							{disabled}
							error={$errors.exceptions?.[index]?.end?.join(' ')}
							bind:value={$data.exceptions[index].end}
						/></FormField
					>
				</div>
			</div>
		{/each}
	{/if}
</section>
