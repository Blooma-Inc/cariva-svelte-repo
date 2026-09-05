<script lang="ts" module>
	export interface StaffActionsProps {
		staff: StaffItem;
	}
</script>

<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import UserCogIcon from '@lucide/svelte/icons/user-cog';
	import LockIcon from '@lucide/svelte/icons/lock-keyhole';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import BanIcon from '@lucide/svelte/icons/ban';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';

	let { staff }: StaffActionsProps = $props();
	let { AppStore } = stores;

	const isSuspended = $derived(!staff.is_active);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="secondary" size="icon">
				<EllipsisVerticalIcon class="size-3" />
				<span class="sr-only">Open staff actions</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="w-fit">
		<DropdownMenu.Item onclick={() => {}}>
			<EyeIcon class="size-3" />
			View Profile
		</DropdownMenu.Item>

		<DropdownMenu.Item
			onclick={() => {
				AppStore.toggleModals({
					open: true,
					name: AppModals.STAFF_FORM_MODAL,
					user_uid: JSON.stringify(staff)
				});
			}}
		>
			<PencilIcon class="size-3" />
			Edit Details
		</DropdownMenu.Item>

		<DropdownMenu.Item onclick={() => {}}>
			<UserCogIcon class="size-3" />
			Change Role
		</DropdownMenu.Item>

		<DropdownMenu.Item onclick={() => {}}>
			<LockIcon class="size-3" />
			Reset Password
		</DropdownMenu.Item>

		<DropdownMenu.Item>
			<ScrollTextIcon class="size-3" />
			View Audit Trail
		</DropdownMenu.Item>

		<DropdownMenu.Separator />

		<DropdownMenu.Item variant={isSuspended ? 'default' : 'destructive'}>
			<BanIcon class="size-3" />
			{isSuspended ? 'Activate Account' : 'Deactivate Account'}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
