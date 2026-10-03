<script lang="ts" module>
	import { z } from 'zod';

	export const PatientRegistrySearchSchema = z.object({
		first_name: z.string().trim().optional(),
		last_name: z.string().trim().optional(),
		other_name: z.string().trim().optional(),
		gender: z.string().trim().optional(),
		patient_no: z.string().trim().optional(),
		imported_patient_no: z.string().trim().optional(),
		nin: z.string().trim().optional()
	});

	export type PatientRegistrySearch = z.infer<typeof PatientRegistrySearchSchema>;
</script>

<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { getChangedFields } from '$lib/utils';
	import { stores } from '$lib/store/index.svelte';
	import UserAvatar from '$lib/components/user-avatar.svelte';
	import { formatDate } from '$lib/utils/date';

	const { PatientStore } = stores;
	let searchResult = $state<Array<PatientSearchResultItem> | undefined>([]);

	const blankForm = {
		first_name: '',
		last_name: '',
		other_name: '',
		gender: '',
		patient_no: '',
		imported_patient_no: '',
		nin: ''
	};

	const form = superForm(blankForm, {
		SPA: true,
		resetForm: false,
		validators: zod4Client(PatientRegistrySearchSchema),
		onUpdate: async ({ form }) => {
			if (form.valid) {
				const params = getChangedFields<PatientRegistrySearch>(blankForm, form.data);
				const registryResult = await PatientStore.searchRegistry(params);
				searchResult = registryResult;
			}
		}
	});

	const { form: formData, enhance } = form;

	const changedFields = $derived.by(() => {
		return getChangedFields<PatientRegistrySearch>(blankForm, $formData);
	});
	const hasChanges = $derived(Object.keys(changedFields).length > 0);
</script>

<Card>
	<CardHeader>
		<CardTitle>Registry search</CardTitle>
	</CardHeader>

	<CardContent class="flex flex-col gap-3">
		<form use:enhance class="auto-grid">
			<FormField {form} name="first_name">
				<InputField label="First Name" showClear type="text" bind:value={$formData.first_name} />
			</FormField>
			<FormField {form} name="last_name">
				<InputField label="Last Name" showClear type="text" bind:value={$formData.last_name} />
			</FormField>
			<FormField {form} name="other_name">
				<InputField label="Other Name" showClear type="text" bind:value={$formData.other_name} />
			</FormField>
			<FormField {form} name="nin">
				<InputField label="NIN" name="nin" showClear type="text" bind:value={$formData.nin} />
			</FormField>
			<Button type="submit" disabled={!hasChanges} isLoading={false}>Search</Button>
		</form>

		<div class="flex flex-col gap-2">
			{#if searchResult}
				{#each searchResult as patient (patient.uid)}
					<div>
						<UserAvatar
							photoUrl=""
							firstName={patient.first_name}
							lastName={patient.last_name}
							email={`DOB: ${formatDate(patient.date_of_birth)}`}
						/>
					</div>
				{/each}
			{/if}
		</div>
	</CardContent>
</Card>
