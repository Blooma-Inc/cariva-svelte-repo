import {
	BellDotIcon,
	Building2Icon,
	ChartPieIcon,
	LayoutDashboardIcon,
	LogsIcon,
	SettingsIcon
} from '@cariva/ui/icons';
import { EnumRole } from './roles';
import ROUTES from './routes';

export const menuConfig: Record<string, MenuItem[]> = {
	[EnumRole.PLATFORM_SUPER_ADMIN]: [
		{
			title: ROUTES.DASHBOARD.title,
			url: ROUTES.DASHBOARD.path,
			icon: LayoutDashboardIcon
		},
		{
			title: ROUTES.TENANT.title,
			url: ROUTES.TENANT.path,
			icon: Building2Icon
		},
		{
			title: ROUTES.SYSTEM_SETTINGS.title,
			url: ROUTES.SYSTEM_SETTINGS.path,
			icon: SettingsIcon
		},
		{
			title: ROUTES.AUDIT_LOGS.title,
			url: ROUTES.AUDIT_LOGS.path,
			icon: LogsIcon
		},
		{
			title: ROUTES.PLATFORM_ANALYTICS.title,
			url: ROUTES.PLATFORM_ANALYTICS.path,
			icon: ChartPieIcon
		}
	]
};

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
