<script lang="ts">
	import { untrack } from 'svelte';
	import type { Time, CalendarDateTime } from '@internationalized/date';
	import { parseScheduleField, serializeScheduleField } from './schedule-field-values';
	import { TimeField, DateTimeField } from '@cariva/ui/components/date-fields/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { FormControl } from '@cariva/ui/components/ui/form/index.js';

	let {
		value = $bindable(''),
		label,
		type,
		enhanced = false,
		disabled = false,
		error
	}: {
		value: string;
		label: string;
		type: 'time' | 'datetime-local';
		enhanced?: boolean;
		disabled?: boolean;
		error?: string;
	} = $props();
	let current = $state<Time | CalendarDateTime | undefined>(
		untrack(() => parseScheduleField(value, type))
	);
	let previous = untrack(() => value);
	function commit(next: Time | CalendarDateTime | undefined) {
		current = next;
		previous = serializeScheduleField(next, value, type);
		value = previous;
	}
	function edit({ incomplete }: { incomplete: boolean }) {
		if (incomplete) {
			previous = '';
			value = '';
		}
	}
	$effect(() => {
		if (value !== previous) {
			previous = value;
			current = parseScheduleField(value, type);
		}
	});
</script>

{#if enhanced}
	<FormControl>
		{#snippet children({ props })}
			{#if type === 'time'}
				<TimeField
					{...props}
					{label}
					{disabled}
					{error}
					value={current as Time | undefined}
					onValueChange={commit}
					onEditStateChange={edit}
					hourCycle={12}
					granularity="second"
					required
				/>
			{:else}
				<DateTimeField
					{...props}
					{label}
					{disabled}
					{error}
					value={current as CalendarDateTime | undefined}
					onValueChange={commit}
					onEditStateChange={edit}
					hourCycle={12}
					granularity="second"
					required
				/>
			{/if}
		{/snippet}
	</FormControl>
{:else}
	<InputField {type} step="1" {label} {disabled} bind:value />
{/if}
