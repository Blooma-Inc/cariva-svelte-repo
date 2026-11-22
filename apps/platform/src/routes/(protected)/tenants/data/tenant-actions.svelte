<script lang="ts" module>
	export interface TenantActionsProps {
		tenant: PlatformTenantItem;
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import BanIcon from '@lucide/svelte/icons/ban';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import HeartXIcon from '@lucide/svelte/icons/heart-x';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { TenantStatusEnum } from './tenant-status-badge';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import ROUTES from '$lib/configs/routes.svelte';

	let { tenant }: TenantActionsProps = $props();
	const { AppStore, PermissionStore } = stores;

	const isSuspended = $derived(tenant.status === TenantStatusEnum.SUSPENDED);
	const isOnBoarding = $derived(tenant.status === TenantStatusEnum.ONBOARDING);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="secondary" size="icon">
				<EllipsisVerticalIcon class="size-3" />
				<span class="sr-only">Open tenant actions</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="w-fit">
		{#if isOnBoarding}
			<DropdownMenu.Item
				disabled={!PermissionStore.can(PERMISSIONS.TENANTS_UPDATE)}
				onclick={() => {
					AppStore.toggleModals({
						open: true,
						name: AppModals.TENANT_FORM_MODAL,
						tenant_uid: JSON.stringify(tenant)
					});
				}}
			>
				<PencilIcon class="size-3" />
				Edit tenant
			</DropdownMenu.Item>
			<DropdownMenu.Item
				onclick={() => {
					AppStore.toggleModals({
						open: true,
						name: AppModals.ACTIVATE_TENANT_MODAL,
						tenant_uid: tenant.uid,
						tenant_name: tenant.name
					});
				}}
			>
				<ShieldCheckIcon class="size-3" />
				Activate tenant
			</DropdownMenu.Item>

			<DropdownMenu.Item variant="destructive">
				<HeartXIcon class="size-3" />
				Reject tenant
			</DropdownMenu.Item>
		{:else}
			<DropdownMenu.Item onclick={() => goto(ROUTES.TENANT_DETAILS.resolve({ id: tenant.uid }))}>
				<EyeIcon class="size-3" />
				View tenant
			</DropdownMenu.Item>

			<DropdownMenu.Item>
				<RefreshCwIcon class="size-3" />
				Change plan
			</DropdownMenu.Item>

			<DropdownMenu.Item>
				<ScrollTextIcon class="size-3" />
				View audit logs
			</DropdownMenu.Item>

			<DropdownMenu.Separator />

			<DropdownMenu.Item variant="destructive">
				<BanIcon class="size-3" />
				{isSuspended ? 'Reactivate tenant' : 'Suspend tenant'}
			</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
