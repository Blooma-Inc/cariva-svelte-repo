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
	import { EnumRole } from '$lib/configs/roles';
	import { menuCommon, getMenuForRole } from '$lib/configs/menu-items';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '@cariva/ui/components/ui/collapsible/index.js';
	import NavUser from './nav-user.svelte';

	const isActive = (url: string) => page.url.pathname === url || page.url.pathname.startsWith(url);

	const isSubmenuActive = (submenu: { url: string }[]) =>
		submenu.some((item) => isActive(item.url));

	const isCurrentPath = (menuItem: MenuItem, currentPath: string): boolean => {
		if (!menuItem.url) return false;

		if (!menuItem.isNestable) return menuItem.url === currentPath;

		return (
			currentPath === menuItem.url ||
			currentPath.startsWith(menuItem.url.endsWith('/') ? menuItem.url : `${menuItem.url}/`)
		);
	};

	const roleMenu = $derived(getMenuForRole(EnumRole.PLATFORM_SUPER_ADMIN));
</script>

<Sidebar collapsible="icon">
	<SidebarHeader class="flex flex-row items-center justify-between bg-white">
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton class="bg-neutral-50 text-xl! text-black! hover:bg-transparent">
					<img src={CarivaIcon} alt="cariva logo" width={24} height={24} />
					<span class="text-primary">Cariva</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarHeader>
	<SidebarContent class="bg-white">
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
	<SidebarFooter class="bg-white">
		<NavUser />
	</SidebarFooter>
	<SidebarRail />
</Sidebar>
