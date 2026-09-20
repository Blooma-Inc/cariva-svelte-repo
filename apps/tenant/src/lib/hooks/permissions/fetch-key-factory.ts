import { PERMISSIONS, ROLES } from '$lib/constants/api';

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
			keys: () => [ROLES.ALL, PERMISSIONS.ME] as const
		};
	},

	getUserPermissionsOverride(user_uid: string) {
		return {
			path: PERMISSIONS.OVERRIDE.concat(`/${user_uid}`),
			keys: () => [ROLES.ALL, user_uid] as const
		};
	}
};
