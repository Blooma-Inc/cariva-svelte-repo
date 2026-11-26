<script lang="ts">
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import BanIcon from '@lucide/svelte/icons/ban';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';

	let {
		service,
		onOpen
	}: {
		service: HealthcareServiceItem;
		onOpen: (mode: 'view' | 'form' | 'status', uid: string) => void;
	} = $props();
	const { PermissionStore } = stores;
	const canRead = $derived(PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ));
	const canUpdate = $derived(PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_UPDATE));
</script>

{#if canRead}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="secondary" size="icon">
					<EllipsisVerticalIcon class="size-3" />
					<span class="sr-only">Open actions for {service.name}</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-fit">
			<DropdownMenu.Item onclick={() => onOpen('view', service.uid)}>
				<EyeIcon class="size-3" />
				View service
			</DropdownMenu.Item>
			{#if canUpdate}
				<DropdownMenu.Item onclick={() => onOpen('form', service.uid)}>
					<PencilIcon class="size-3" />
					Edit service
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					variant={service.is_active ? 'destructive' : 'default'}
					onclick={() => onOpen('status', service.uid)}
				>
					{#if service.is_active}<BanIcon class="size-3" />{:else}<CircleCheckIcon
							class="size-3"
						/>{/if}
					{service.is_active ? 'Deactivate' : 'Activate'} service
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
