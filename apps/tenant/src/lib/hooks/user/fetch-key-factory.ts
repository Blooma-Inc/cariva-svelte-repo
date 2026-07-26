import { AUTH, USER } from '$lib/constants/api';

export const user = {
	getUserProfile() {
		return {
			path: USER.PROFILE,
			keys: () => [AUTH.CURRENT_USER, USER.PROFILE] as const
		};
	}
};
