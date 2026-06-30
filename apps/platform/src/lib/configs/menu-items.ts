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
		url: ROUTES.DASHBOARD.href,
		icon: LayoutDashboardIcon,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	},
	{
		title: ROUTES.TENANT.title,
		url: ROUTES.TENANT.href,
		icon: Building2Icon,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	},
	{
		title: ROUTES.SYSTEM_SETTINGS.title,
		url: ROUTES.SYSTEM_SETTINGS.href,
		icon: SettingsIcon,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	},
	{
		title: ROUTES.AUDIT_LOGS.title,
		url: ROUTES.AUDIT_LOGS.href,
		icon: LogsIcon,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	},
	{
		title: ROUTES.PLATFORM_ANALYTICS.title,
		url: ROUTES.PLATFORM_ANALYTICS.href,
		icon: ChartPieIcon,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	}
];

export function getMenuForRole(role: EnumRole): MenuItem[] {
	return ALL_MENU_ITEMS.filter((item) => item.roles.includes(role)).map((item) => item);
}

export const menuCommon: MenuItem[] = [
	{
		title: ROUTES.NOTIFICATION.title,
		url: ROUTES.NOTIFICATION.href,
		icon: BellDotIcon
	},
	{
		title: ROUTES.SETTINGS.title,
		url: ROUTES.SETTINGS.href,
		icon: SettingsIcon
	}
];
