import { ROLES } from '$lib/constants/api';

export const role = {
	getRoles() {
		return {
			path: ROLES.ALL,
			keys: () => [ROLES.ALL] as const
		};
	},

	getPermissions(roleUid: string) {
		return {
			path: ROLES.PERMISSIONS.replace(':uid', roleUid),
			keys: () => [ROLES.ALL, ROLES.PERMISSIONS, roleUid] as const
		};
	},

	getRolePermissionMatrix() {
		return {
			path: ROLES.PERMISSION_MATRIX,
			keys: () => [ROLES.ALL, ROLES.PERMISSION_MATRIX] as const
		};
	}
};
