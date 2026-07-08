import {
	BellDotIcon,
	Building2Icon,
	ChartPieIcon,
	LayoutDashboardIcon,
	LogsIcon,
	SettingsIcon
} from '@cariva/ui/icons';
import { EnumRole } from './roles';
import ROUTES from './routes.svelte';

const ALL_MENU_ITEMS: RoleMenuItem[] = [
	{
		title: ROUTES.DASHBOARD.title,
		url: ROUTES.DASHBOARD.path,
		icon: LayoutDashboardIcon,
		roles: ROUTES.DASHBOARD.roles
	},
	{
		title: ROUTES.TENANT.title,
		url: ROUTES.TENANT.path,
		icon: Building2Icon,
		roles: ROUTES.TENANT.roles
	},
	{
		title: ROUTES.SYSTEM_SETTINGS.title,
		url: ROUTES.SYSTEM_SETTINGS.path,
		icon: SettingsIcon,
		roles: ROUTES.SYSTEM_SETTINGS.roles
	},
	{
		title: ROUTES.AUDIT_LOGS.title,
		url: ROUTES.AUDIT_LOGS.path,
		icon: LogsIcon,
		roles: ROUTES.AUDIT_LOGS.roles
	},
	{
		title: ROUTES.PLATFORM_ANALYTICS.title,
		url: ROUTES.PLATFORM_ANALYTICS.path,
		icon: ChartPieIcon,
		roles: ROUTES.PLATFORM_ANALYTICS.roles
	}
];

export function getMenuForRole(role: EnumRole): MenuItem[] {
	return ALL_MENU_ITEMS.filter((item) => item.roles.includes(role)).map((item) => item);
}

export const menuCommon: MenuItem[] = [
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
