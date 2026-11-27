<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import * as Dialog from '@cariva/ui/components/ui/dialog/index.js';
	import ScheduleTemporalField from '$lib/components/scheduling/schedule-temporal-field.svelte';
	const form = superForm({ date: '' }, { SPA: true, validators: false });
	const { form: data } = form;
</script>

<Dialog.Root open>
	<Dialog.Content>
		<Dialog.Header
			><Dialog.Title>Schedule field test</Dialog.Title><Dialog.Description
				>Choose a date and time without saving a schedule.</Dialog.Description
			></Dialog.Header
		>
		<FormField {form} name="date"
			><ScheduleTemporalField
				label="Starts at"
				type="datetime-local"
				enhanced
				bind:value={$data.date}
			/></FormField
		>
	</Dialog.Content>
</Dialog.Root>
