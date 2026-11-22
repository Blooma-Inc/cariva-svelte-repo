import BellDotIcon from '@lucide/svelte/icons/bell-dot';
import Building2Icon from '@lucide/svelte/icons/building';
import ChartPieIcon from '@lucide/svelte/icons/chart-pie';
import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import LogsIcon from '@lucide/svelte/icons/logs';
import SettingsIcon from '@lucide/svelte/icons/settings';
import ROUTES from './routes.svelte';
import UserRoundPenIcon from '@lucide/svelte/icons/user-round-pen';

const ALL_MENU_ITEMS: MenuItem[] = [
	{
		title: ROUTES.DASHBOARD.title,
		url: ROUTES.DASHBOARD.path,
		icon: LayoutDashboardIcon,
		requiredPermission: ROUTES.DASHBOARD.requiredPermission
	},
	{
		title: ROUTES.TENANT.title,
		url: ROUTES.TENANT.path,
		icon: Building2Icon,
		requiredPermission: ROUTES.TENANT.requiredPermission,
		isNestable: true
	},
	{
		title: ROUTES.SYSTEM_SETTINGS.title,
		url: ROUTES.SYSTEM_SETTINGS.path,
		icon: SettingsIcon,
		requiredPermission: ROUTES.SYSTEM_SETTINGS.requiredPermission
	},
	{
		title: ROUTES.AUDIT_LOGS.title,
		url: ROUTES.AUDIT_LOGS.path,
		icon: LogsIcon,
		requiredPermission: ROUTES.AUDIT_LOGS.requiredPermission
	},
	{
		title: ROUTES.PLATFORM_ANALYTICS.title,
		url: ROUTES.PLATFORM_ANALYTICS.path,
		icon: ChartPieIcon,
		requiredPermission: ROUTES.PLATFORM_ANALYTICS.requiredPermission
	}
];

export function getMenuForUser(permissions: string[]): MenuItem[] {
	return ALL_MENU_ITEMS.filter(
		(item) => !item.requiredPermission || permissions.includes(item.requiredPermission)
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
