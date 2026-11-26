<script lang="ts" module>
	import { z } from 'zod';
	export const ServiceFormSchema = z.object({
		name: z
			.string()
			.trim()
			.min(1, 'Service name is required.')
			.max(255, 'Use at most 255 characters.'),
		description: z.string().trim()
	});
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { TextareaField } from '@cariva/ui/components/form-inputs/textarea-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { getChangedFields } from '$lib/utils';
	let { service, onSuccess }: { service?: HealthcareServiceItem; onSuccess: () => void } = $props();
	const { HealthcareServiceStore: serviceStore, PermissionStore } = stores;
	const canWrite = $derived(
		PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ) &&
			PermissionStore.can(
				service ? PERMISSIONS.HEALTHCARE_SERVICES_UPDATE : PERMISSIONS.HEALTHCARE_SERVICES_CREATE
			)
	);
	const initial = untrack(() => ({
		name: service?.name ?? '',
		description: service?.description ?? ''
	}));
	const payload = (data: typeof initial) => ({
		name: data.name.trim(),
		description: data.description.trim() || null
	});
	const form = superForm(initial, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(ServiceFormSchema),
		onUpdated: async ({ form: updated }) => {
			if (!updated.valid || !canWrite) return;
			const changes = service
				? getChangedFields(payload(initial), payload(updated.data))
				: payload(updated.data);
			if (!Object.keys(changes).length) return;
			await serviceStore.save(service?.uid ?? '', changes, onSuccess);
		}
	});
	const { form: data, enhance } = form;
	const changed = $derived(
		Object.keys(getChangedFields(payload(initial), payload($data))).length > 0
	);
</script>

<form use:enhance class="flex flex-col gap-4">
	<fieldset disabled={serviceStore.loading || !canWrite} class="flex flex-col gap-4">
		<FormField {form} name="name"
			><InputField
				label="Service name"
				maxlength={255}
				bind:value={$data.name}
				required
			/></FormField
		>
		<FormField {form} name="description"
			><TextareaField label="Description (optional)" bind:value={$data.description} /></FormField
		>
	</fieldset>
	{#if serviceStore.error}<p role="alert" class="text-sm text-destructive">
			{serviceStore.error}
		</p>{/if}
	{#if !canWrite}<p role="alert">You do not have permission to save this service.</p>{/if}
	<Button
		type="submit"
		isLoading={serviceStore.loading}
		disabled={!canWrite || serviceStore.loading || (!!service && !changed)}
		>{service ? 'Save changes' : 'Create service'}</Button
	>
</form>
