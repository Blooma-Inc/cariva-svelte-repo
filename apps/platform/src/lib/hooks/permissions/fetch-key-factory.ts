import { PERMISSIONS } from '$lib/constants/api';

export const permissions = {
	getMyPermissions(userUid: string) {
		return {
			path: PERMISSIONS.ME,
			keys: () => [PERMISSIONS.ME, userUid] as const
		};
	}
};
