<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { CheckField } from '@cariva/ui/components/form-inputs/check-field/index.js';
	import type { TOverridesSchema } from './index.svelte';

	let {
		form,
		permissionUid,
		action,
		label
	}: {
		form: SuperForm<TOverridesSchema>;
		permissionUid: string;
		action: 'grant' | 'revoke';
		label: string;
	} = $props();

	const { form: formData } = form;
	const index = $derived($formData.overrides.findIndex((o) => o.permission_uid === permissionUid));
</script>

{#if index !== -1}
	<FormField {form} name={`overrides[${index}].action`}>
		<CheckField
			label=""
			aria-label={label}
			bind:checked={
				() => $formData.overrides[index].action === action,
				(checked: boolean) => {
					$formData.overrides[index].action = checked ? action : null;
				}
			}
		/>
	</FormField>
{/if}
