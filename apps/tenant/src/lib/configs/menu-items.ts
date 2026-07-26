import BellDotIcon from '@lucide/svelte/icons/bell-dot';
import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import SettingsIcon from '@lucide/svelte/icons/settings';
import { EnumRole } from './roles';
import ROUTES from './routes.svelte';
import UserRoundPenIcon from '@lucide/svelte/icons/user-round-pen';
import LogsIcon from '@lucide/svelte/icons/logs';
import UsersIcon from '@lucide/svelte/icons/users';
import ShieldUserIcon from '@lucide/svelte/icons/shield-user';
import HospitalIcon from '@lucide/svelte/icons/hospital';

const ALL_MENU_ITEMS: RoleMenuItem[] = [
	{
		title: ROUTES.DASHBOARD.title,
		url: ROUTES.DASHBOARD.path,
		icon: LayoutDashboardIcon,
		roles: []
	},
	{
		title: ROUTES.BRANCHES.title,
		url: ROUTES.BRANCHES.path,
		icon: HospitalIcon,
		roles: [EnumRole.TENANT_ADMIN]
	},
	{
		title: ROUTES.STAFF.title,
		url: ROUTES.STAFF.path,
		icon: UsersIcon,
		roles: [EnumRole.TENANT_ADMIN]
	},
	{
		title: ROUTES.PATIENTS.title,
		url: ROUTES.PATIENTS.path,
		icon: ShieldUserIcon,
		roles: [EnumRole.TENANT_ADMIN]
	},
	{
		title: ROUTES.AUDIT_LOGS.title,
		url: ROUTES.AUDIT_LOGS.path,
		icon: LogsIcon,
		roles: ROUTES.AUDIT_LOGS.roles
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
