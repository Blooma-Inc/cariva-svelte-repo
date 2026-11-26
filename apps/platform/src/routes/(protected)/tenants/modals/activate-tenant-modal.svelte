<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '@cariva/ui/components/ui/dialog/index.js';
	import {
		Item,
		ItemContent,
		ItemDescription,
		ItemTitle
	} from '@cariva/ui/components/ui/item/index.js';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { tenantDetailQueryKeys } from '$lib/hooks/tenant/fetch-key-factory';
	import { PERMISSIONS } from '$lib/configs/permissions';

	const { AppStore, TenantStore, PermissionStore } = stores;
	const query = useQueryClient();

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.ACTIVATE_TENANT_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.ACTIVATE_TENANT_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
		class="max-w-xl!"
	>
		<DialogHeader>
			<Heading level="h2">Activate Tenant</Heading>
			<Paragraph class="text-neutral-500!"
				>You are about to activate <strong class="text-info"
					>{AppStore.tenantModal.tenant_name}</strong
				>.</Paragraph
			>
		</DialogHeader>

		<Item class="bg-warning/20 p-3">
			<ItemContent class="gap-2">
				<ItemTitle>What happens next ?</ItemTitle>

				<ItemContent class="gap-1">
					<div class="flex items-center justify-start gap-2">
						<CircleCheckIcon class="size-3 text-warning" />
						<ItemDescription>
							Tenant and subscription will be activated and notified via email.
						</ItemDescription>
					</div>
					<div class="flex items-center justify-start gap-2">
						<CircleCheckIcon class="size-3 text-warning" />
						<ItemDescription>Tenant Main branch will be activated.</ItemDescription>
					</div>
					<div class="flex items-center justify-start gap-2">
						<CircleCheckIcon class="size-3 text-warning" />
						<ItemDescription
							>Tenant Admin will be activated and admin will be notified via email.</ItemDescription
						>
					</div>
				</ItemContent>
			</ItemContent>
		</Item>

		<DialogFooter>
			<Button
				size="lg"
				variant="secondary"
				class="w-fit"
				onclick={handleClose}
				disabled={TenantStore.loaders.isTenantRequest}>Close</Button
			>
			<Button
				size="lg"
				class="w-fit"
				onclick={async () =>
					await TenantStore.activateTenant(AppStore.tenantModal.tenant_uid, () => {
						for (const queryKey of tenantDetailQueryKeys(AppStore.tenantModal.tenant_uid))
							void query.invalidateQueries({ queryKey });
						handleClose();
					})}
				disabled={TenantStore.loaders.isTenantRequest ||
					!PermissionStore.canAll([PERMISSIONS.TENANTS_READ, PERMISSIONS.TENANTS_MANAGE])}
				isLoading={TenantStore.loaders.isTenantRequest}>Activate</Button
			>
		</DialogFooter>
	</DialogContent>
</DialogModal>
