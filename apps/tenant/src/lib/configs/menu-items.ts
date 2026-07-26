import BellDotIcon from '@lucide/svelte/icons/bell-dot';
import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import SettingsIcon from '@lucide/svelte/icons/settings';
import { EnumRole } from './roles';
import ROUTES from './routes.svelte';
import UserRoundPenIcon from '@lucide/svelte/icons/user-round-pen';

const ALL_MENU_ITEMS: RoleMenuItem[] = [
	{
		title: ROUTES.DASHBOARD.title,
		url: ROUTES.DASHBOARD.path,
		icon: LayoutDashboardIcon,
		roles: []
	}
];

export function getMenuForRole(role: EnumRole): MenuItem[] {
	return ALL_MENU_ITEMS.filter((item) => item.roles.length === 0 || item.roles.includes(role)).map(
		(item) => item
	);
}

export const menuCommon: MenuItem[] = [
	{
		title: ROUTES.PROFILE.title,
		url: ROUTES.PROFILE.path,
		icon: UserRoundPenIcon
	},
	{
		title: ROUTES.NOTIFICATION.title,
		url: ROUTES.NOTIFICATION.path,
		icon: BellDotIcon
	},
	{
		title: ROUTES.SETTINGS.title,
		url: ROUTES.SETTINGS.path,
		icon: SettingsIcon
	}
];
