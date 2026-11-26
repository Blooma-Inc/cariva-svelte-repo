<script lang="ts" module>
	import { z } from 'zod';
	const schema = z.object({ reason: z.string().trim() });
</script>

<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { tenantDetailQueryKeys } from '$lib/hooks/tenant/fetch-key-factory';
	import { toTitleCase } from '$lib/utils/strings';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		DialogContent,
		DialogHeader,
		DialogFooter
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { TextareaField } from '@cariva/ui/components/form-inputs/textarea-field/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { useQueryClient } from '@tanstack/svelte-query';

	const { AppStore, TenantStore, PermissionStore } = stores;
	const context = AppStore.tenantLifecycleModal;
	const queryClient = useQueryClient();
	const label = toTitleCase(context.action);
	TenantStore.errors.isTenantLifecycle = '';
	const canManage = $derived(
		PermissionStore.canAll([PERMISSIONS.TENANTS_READ, PERMISSIONS.TENANTS_MANAGE])
	);
	const busy = $derived(TenantStore.loaders.isTenantLifecycle);
	const close = () => {
		if (!busy) AppStore.toggleModals({ name: AppModals.TENANT_LIFECYCLE_MODAL, open: false });
	};
	const form = superForm(
		{ reason: '' },
		{
			SPA: true,
			resetForm: false,
			validators: zod4Client(
				context.action === 'activate'
					? schema
					: schema.extend({ reason: z.string().trim().min(1, 'Enter a reason.') })
			),
			onUpdated: async ({ form }) => {
				if (!form.valid || !canManage || busy) return;
				await TenantStore.changeTenantStatus(
					context.tenant_uid,
					context.status,
					context.action,
					form.data.reason,
					() => {
						for (const queryKey of tenantDetailQueryKeys(context.tenant_uid))
							void queryClient.invalidateQueries({ queryKey });
						AppStore.toggleModals({ name: AppModals.TENANT_LIFECYCLE_MODAL, open: false });
					}
				);
			}
		}
	);
	const { form: formData, enhance } = form;
</script>

<DialogModal isOpen={AppStore.isOpen.TENANT_LIFECYCLE_MODAL} closeModal={close}>
	<DialogContent
		class="max-w-xl!"
		showCloseButton={!busy}
		onInteractOutside={(event) => event.preventDefault()}
		onEscapeKeydown={(event) => {
			if (busy) event.preventDefault();
		}}
	>
		<DialogHeader>
			<Heading level="h2">{label} tenant</Heading>
			<Paragraph size="sm"
				>Confirm that you want to {context.action} {context.tenant_name}.</Paragraph
			>
		</DialogHeader>
		<Paragraph size="sm" muted>
			{#if context.action === 'activate'}This activates the tenant, main branch, administrator and
				subscription, and sends the setup emails.
			{:else if context.action === 'reject'}This rejects the tenant's onboarding request.
			{:else}This suspends the tenant. There is currently no reactivation action available in the
				platform.{/if}
		</Paragraph>
		<form id="tenant-lifecycle-form" use:enhance>
			<fieldset disabled={busy || !canManage}>
				<FormField {form} name="reason"
					><TextareaField
						label={context.action === 'activate' ? 'Activation notes (optional)' : 'Reason'}
						bind:value={$formData.reason}
					/></FormField
				>
			</fieldset>
			{#if TenantStore.errors.isTenantLifecycle}<p
					role="alert"
					class="mt-3 text-sm text-destructive"
				>
					{TenantStore.errors.isTenantLifecycle}
				</p>{/if}
		</form>
		<DialogFooter>
			<Button variant="secondary" onclick={close} disabled={busy}>Cancel</Button>
			{#if canManage}<Button
					type="submit"
					form="tenant-lifecycle-form"
					variant={context.action === 'activate' ? 'default' : 'destructive'}
					disabled={busy}
					isLoading={busy}>{label} tenant</Button
				>{/if}
		</DialogFooter>
	</DialogContent>
</DialogModal>
