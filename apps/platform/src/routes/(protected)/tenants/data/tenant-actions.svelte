<script lang="ts" module>
	export interface TenantActionsProps {
		tenant: PlatformTenantItem;
	}
</script>

<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import BanIcon from '@lucide/svelte/icons/ban';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';

	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';

	let { tenant }: TenantActionsProps = $props();

	const isSuspended = $derived(tenant.status === 'suspended');
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
		<DropdownMenu.Item>
			<EyeIcon class="size-3" />
			View tenant
		</DropdownMenu.Item>

		<DropdownMenu.Item>
			<PencilIcon class="size-3" />
			Edit tenant
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

		<DropdownMenu.Item class="text-destructive focus:text-destructive">
			<BanIcon class="size-3" />
			{isSuspended ? 'Reactivate tenant' : 'Suspend tenant'}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
