<script lang="ts">
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '@cariva/ui/components/ui/sidebar/index.js';
	import { useSidebar } from '@cariva/ui/components/ui/sidebar/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import UserAvatar from '../user-avatar.svelte';

	let { AuthStore, AppStore } = stores;
	const sidebar = useSidebar();
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<UserAvatar
							class="size-8 rounded-lg"
							photoUrl={AuthStore.user.profile_photo_url}
							firstName={AuthStore.user.first_name ?? ''}
							lastName={AuthStore.user.last_name ?? ''}
							email={AuthStore.user.email ?? ''}
						/>
						<ChevronDownIcon class="ms-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="px-1 py-1.5">
						<UserAvatar
							class="size-8 rounded-lg"
							photoUrl={AuthStore.user.profile_photo_url}
							firstName={AuthStore.user.first_name ?? ''}
							lastName={AuthStore.user.last_name ?? ''}
							email={AuthStore.user.email ?? ''}
						/>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>Notifications</DropdownMenu.Item>
					<DropdownMenu.Item>Profile</DropdownMenu.Item>
					<DropdownMenu.Item>Security</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					variant="destructive"
					onclick={() => AppStore.toggleModals({ name: AppModals.LOGOUT_MODAL, open: true })}
				>
					<LogOutIcon />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
