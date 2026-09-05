<script lang="ts" module>
	export interface BranchActionsProps {
		branch: TenantBranchItem;
	}
</script>

<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import BanIcon from '@lucide/svelte/icons/ban';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { goto } from '$app/navigation';
	import ROUTES from '$lib/configs/routes.svelte';

	let { branch }: BranchActionsProps = $props();
	let { AppStore } = stores;

	const isSuspended = $derived(!branch.is_active);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="secondary" size="icon">
				<EllipsisVerticalIcon class="size-3" />
				<span class="sr-only">Open branch actions</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="w-fit">
		<DropdownMenu.Item
			onclick={() => {
				goto(ROUTES.SINGLE_BRANCH.resolve({ id: branch.uid }));
			}}
		>
			<EyeIcon class="size-3" />
			View branch
		</DropdownMenu.Item>

		<DropdownMenu.Item
			onclick={() => {
				AppStore.toggleModals({
					open: true,
					name: AppModals.BRANCH_FORM_MODAL,
					branch_uid: JSON.stringify(branch)
				});
			}}
		>
			<PencilIcon class="size-3" />
			Edit branch
		</DropdownMenu.Item>

		<DropdownMenu.Item>
			<ScrollTextIcon class="size-3" />
			View audit logs
		</DropdownMenu.Item>

		<DropdownMenu.Separator />

		<DropdownMenu.Item variant="destructive">
			<BanIcon class="size-3" />
			{isSuspended ? 'Reactivate branch' : 'Suspend branch'}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
