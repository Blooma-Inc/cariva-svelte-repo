import BellDotIcon from '@lucide/svelte/icons/bell-dot';
import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import SettingsIcon from '@lucide/svelte/icons/settings';
import ROUTES from './routes.svelte';
import UserRoundPenIcon from '@lucide/svelte/icons/user-round-pen';
import LogsIcon from '@lucide/svelte/icons/logs';
import UsersIcon from '@lucide/svelte/icons/users';
import ShieldUserIcon from '@lucide/svelte/icons/shield-user';
import HospitalIcon from '@lucide/svelte/icons/hospital';
import StethoscopeIcon from '@lucide/svelte/icons/stethoscope';
import BedDoubleIcon from '@lucide/svelte/icons/bed-double';

const ALL_MENU_ITEMS: MenuItem[] = [
	{
		title: ROUTES.DASHBOARD.title,
		url: ROUTES.DASHBOARD.resolve(),
		requiredPermission: ROUTES.DASHBOARD.requiredPermission,
		icon: LayoutDashboardIcon
	},
	{
		title: ROUTES.BRANCHES.title,
		url: ROUTES.BRANCHES.resolve(),
		requiredPermission: ROUTES.BRANCHES.requiredPermission,
		icon: HospitalIcon
	},
	{
		title: ROUTES.HEALTHCARE_SERVICES.title,
		url: ROUTES.HEALTHCARE_SERVICES.resolve(),
		requiredPermission: ROUTES.HEALTHCARE_SERVICES.requiredPermission,
		icon: StethoscopeIcon
	},
	{
		title: ROUTES.STAFF.title,
		url: ROUTES.STAFF.resolve(),
		requiredPermission: ROUTES.STAFF.requiredPermission,
		icon: UsersIcon
	},
	{
		title: ROUTES.PATIENTS.title,
		url: ROUTES.PATIENTS.resolve(),
		requiredPermission: ROUTES.PATIENTS.requiredPermission,
		icon: ShieldUserIcon
	},
	{
		title: ROUTES.WARDS.title,
		url: ROUTES.WARDS.resolve(),
		requiredPermission: ROUTES.WARDS.requiredPermission,
		icon: BedDoubleIcon
	},
	{
		title: ROUTES.AUDIT_LOGS.title,
		url: ROUTES.AUDIT_LOGS.resolve(),
		requiredPermission: ROUTES.AUDIT_LOGS.requiredPermission,
		icon: LogsIcon
	}
];

export function getMenuForUser(permissions: Array<string>): MenuItem[] {
	return ALL_MENU_ITEMS.filter((item) => {
		if (item.requiredPermission) {
			return permissions.includes(item.requiredPermission);
		}

		return true;
	}).map((item) => item);
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
