<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import CarivaIcon from '$lib/assets/favicon.svg';

	import {
		SidebarHeader,
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarMenuSub,
		SidebarMenuSubButton,
		SidebarMenuSubItem,
		SidebarRail
	} from '@cariva/ui/components/ui/sidebar/index.js';
	import { menuCommon, getMenuForUser } from '$lib/configs/menu-items';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '@cariva/ui/components/ui/collapsible/index.js';
	import NavUser from './nav-user.svelte';
	import { stores } from '$lib/store/index.svelte';

	const { PermissionStore } = stores;
	const isActive = (url: NonNullable<MenuItem['url']>) =>
		page.url.pathname === resolve(url) || page.url.pathname.startsWith(`${resolve(url)}/`);

	const isSubmenuActive = (submenu: { url: NonNullable<MenuItem['url']> }[]) =>
		submenu.some((item) => isActive(item.url));

	const isCurrentPath = (menuItem: MenuItem, currentPath: string): boolean => {
		if (!menuItem.url) return false;

		const url = resolve(menuItem.url);

		if (!menuItem.isNestable) return url === currentPath;

		return currentPath === url || currentPath.startsWith(url.endsWith('/') ? url : `${url}/`);
	};

	const roleMenu = $derived(getMenuForUser([...PermissionStore.permissions]));
</script>

<Sidebar collapsible="icon">
	<SidebarHeader class="flex flex-row items-center justify-between border-b border-sidebar-border">
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton class="h-12 text-lg font-semibold group-data-[collapsible=icon]:p-0!">
					<span
						class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary"
					>
						<img src={CarivaIcon} alt="cariva logo" width={24} height={24} />
					</span>
					<span class="text-sidebar-foreground">Cariva</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarHeader>
	<SidebarContent>
		<SidebarGroup>
			<SidebarGroupLabel>Menu</SidebarGroupLabel>
			<SidebarMenu>
				{#each roleMenu as roleItem (roleItem.title)}
					{#if !roleItem.submenu}
						<a href={resolve(roleItem.url)}>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={isCurrentPath(roleItem, page.url.pathname)}
									tooltipContent={roleItem.title}
								>
									<roleItem.icon class="size-4 shrink-0" />
									<span>{roleItem.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</a>
					{:else}
						<Collapsible class="group/collapsible" open={isSubmenuActive(roleItem.submenu)}>
							<SidebarMenuItem>
								<CollapsibleTrigger>
									<SidebarMenuButton
										tooltipContent={roleItem.title}
										isActive={isSubmenuActive(roleItem.submenu)}
									>
										<roleItem.icon class="size-4 shrink-0" />
										<span>{roleItem.title}</span>
										<ChevronRightIcon
											class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
										/>
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{#each roleItem.submenu as subItem (subItem.title)}
											<SidebarMenuSubItem>
												<SidebarMenuSubButton
													isActive={isCurrentPath(subItem as MenuItem, page.url.pathname)}
												>
													<a href={resolve(subItem.url)}>{subItem.title}</a>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										{/each}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					{/if}
				{/each}
			</SidebarMenu>
		</SidebarGroup>

		<SidebarGroup>
			<SidebarGroupLabel>Others</SidebarGroupLabel>
			<SidebarMenu>
				{#each menuCommon as item (item.title)}
					<a href={resolve(item.url)}>
						<SidebarMenuItem>
							<SidebarMenuButton
								tooltipContent={item.title}
								isActive={isCurrentPath(item, page.url.pathname)}
							>
								<item.icon class="size-4 shrink-0" />
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</a>
				{/each}
			</SidebarMenu>
		</SidebarGroup>
	</SidebarContent>
	<SidebarFooter class="border-t border-sidebar-border">
		<NavUser />
	</SidebarFooter>
	<SidebarRail />
</Sidebar>
