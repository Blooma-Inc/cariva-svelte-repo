<script lang="ts">
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { canAccessBranchServices } from '$lib/utils/branch-service-access';
	let {
		service,
		onOpen
	}: {
		service: BranchHealthcareServiceItem;
		onOpen: (mode: 'view' | 'form' | 'status', serviceUid: string) => void;
	} = $props();
	const canRead = $derived(canAccessBranchServices(stores, service.branch_uid));
	const canUpdate = $derived(
		canRead &&
			canAccessBranchServices(
				stores,
				service.branch_uid,
				PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_UPDATE
			)
	);
</script>

{#if canRead}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			>{#snippet child({ props })}<Button {...props} variant="secondary" size="icon"
					><EllipsisVerticalIcon class="size-3" /><span class="sr-only"
						>Open actions for {service.name}</span
					></Button
				>{/snippet}</DropdownMenu.Trigger
		>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => onOpen('view', service.healthcare_service_uid)}
				>View service</DropdownMenu.Item
			>
			{#if canUpdate}
				<DropdownMenu.Item onclick={() => onOpen('form', service.healthcare_service_uid)}
					>Configure service</DropdownMenu.Item
				>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					variant={service.is_active ? 'destructive' : 'default'}
					disabled={!service.is_active && (!service.catalog_is_active || !service.branch_is_active)}
					onclick={() => onOpen('status', service.healthcare_service_uid)}
					>{service.is_active ? 'Deactivate' : 'Activate'} service</DropdownMenu.Item
				>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
