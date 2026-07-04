<script lang="ts">
	import * as Avatar from '@cariva/ui/components/ui/avatar/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '@cariva/ui/components/ui/sidebar/index.js';
	import { useSidebar } from '@cariva/ui/components/ui/sidebar/index.js';
	import { ChevronDownIcon, LogOutIcon } from '@cariva/ui/icons';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modalTypes';
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
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image
								src={AuthStore.user.profile_photo_url}
								alt={AuthStore.user.profile_photo_url}
							/>
							<Avatar.Fallback class="rounded-lg">PA</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium"
								>{AuthStore.user.first_name} {AuthStore.user.last_name}</span
							>
							<span class="truncate text-xs">{AuthStore.user.email}</span>
						</div>
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
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image
								src={AuthStore.user.profile_photo_url}
								alt={AuthStore.user.profile_photo_url}
							/>
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium"
								>{AuthStore.user.first_name} {AuthStore.user.last_name}</span
							>
							<span class="truncate text-xs">{AuthStore.user.email}</span>
						</div>
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
					onclick={() =>
						AppStore.toggleModals({ name: AppModals.SESSION_TIMEOUT_MODAL, open: true })}
				>
					<LogOutIcon />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
