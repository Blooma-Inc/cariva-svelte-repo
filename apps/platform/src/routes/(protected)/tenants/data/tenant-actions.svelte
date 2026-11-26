<script lang="ts" module>
	export interface TenantActionsProps {
		tenant: PlatformTenantItem;
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import ROUTES from '$lib/configs/routes.svelte';
	import { tenantLifecycleActions } from '$lib/utils/tenant-lifecycle';
	import { toTitleCase } from '$lib/utils/strings';
	let { tenant }: TenantActionsProps = $props();
	const { AppStore, PermissionStore } = stores;
	const canRead = $derived(PermissionStore.can(PERMISSIONS.TENANTS_READ));
	const canManage = $derived(canRead && PermissionStore.can(PERMISSIONS.TENANTS_MANAGE));
	const openAction = (action: TenantLifecycleAction) => {
		if (!canManage || !tenantLifecycleActions(tenant.status).includes(action)) return;
		AppStore.toggleModals({
			name: AppModals.TENANT_LIFECYCLE_MODAL,
			open: true,
			tenant_uid: tenant.uid,
			tenant_name: tenant.name,
			status: tenant.status,
			action
		});
	};
</script>

{#if canRead}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			>{#snippet child({ props })}<Button {...props} variant="secondary" size="icon"
					><EllipsisVerticalIcon class="size-3" /><span class="sr-only">Open tenant actions</span
					></Button
				>{/snippet}</DropdownMenu.Trigger
		>
		<DropdownMenu.Content align="end" class="w-fit">
			<DropdownMenu.Item
				onclick={() => {
					if (canRead) goto(ROUTES.TENANT_DETAILS.resolve({ id: tenant.uid }));
				}}><EyeIcon class="size-3" />View tenant</DropdownMenu.Item
			>
			{#if canManage}
				{#each tenantLifecycleActions(tenant.status) as action (action)}
					<DropdownMenu.Item
						variant={action === 'activate' ? 'default' : 'destructive'}
						onclick={() => openAction(action)}>{toTitleCase(action)} tenant</DropdownMenu.Item
					>
				{/each}
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
