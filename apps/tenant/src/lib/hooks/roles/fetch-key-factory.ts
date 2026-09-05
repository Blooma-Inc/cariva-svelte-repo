import { ROLES } from '$lib/constants/api';

export const role = {
	getRoles() {
		return {
			path: ROLES.ALL,
			keys: () => [ROLES.ALL] as const
		};
	}
};
