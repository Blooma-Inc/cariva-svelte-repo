<script lang="ts" module>
	export interface StaffActionsProps {
		staff: StaffItem;
	}
</script>

<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import LockIcon from '@lucide/svelte/icons/lock-keyhole';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import BanIcon from '@lucide/svelte/icons/ban';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { UseIsOwner } from '$lib/hooks/app/use-is-owner.svelte';
	import { goto } from '$app/navigation';
	import ROUTES from '$lib/configs/routes.svelte';

	let { staff }: StaffActionsProps = $props();
	let { AppStore } = stores;

	const isSuspended = $derived(!staff.is_active);
	const { isOwner } = UseIsOwner(() => staff.uid);
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
		<DropdownMenu.Item onclick={() => goto(ROUTES.SINGLE_STAFF.resolve({ id: staff.uid }))}>
			<EyeIcon class="size-3" />
			View Profile
		</DropdownMenu.Item>

		{#if !isOwner}
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

			<DropdownMenu.Item
				onclick={() => {
					AppStore.toggleModals({
						open: true,
						name: AppModals.RESET_USER_PASSWORD_MODAL,
						user_uid: JSON.stringify(staff)
					});
				}}
			>
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
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
