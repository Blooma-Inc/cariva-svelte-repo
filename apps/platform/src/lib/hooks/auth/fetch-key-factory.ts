import { AUTH } from '$lib/constants/api';

export const auth = {
	getCurrentUser() {
		return {
			path: AUTH.CURRENT_USER,
			keys: () => [AUTH.CURRENT_USER] as const
		};
	}
};
