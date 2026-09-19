import { PERMISSIONS } from '$lib/constants/api';

export const permissions = {
	getPermissionsCatalog() {
		return {
			path: PERMISSIONS.CATALOG,
			keys: () => [PERMISSIONS.CATALOG] as const
		};
	},

	getMyPermissions() {
		return {
			path: PERMISSIONS.ME,
			keys: () => [PERMISSIONS.ME] as const
		};
	},

	getUserOverrides(user_uid: string) {
		return {
			path: PERMISSIONS.CATALOG,
			keys: () => [PERMISSIONS.CATALOG, user_uid] as const
		};
	}
};
