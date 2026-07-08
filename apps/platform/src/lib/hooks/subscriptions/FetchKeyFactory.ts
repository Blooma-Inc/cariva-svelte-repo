import { SUBSCRIPTION } from '$lib/constants/api';

export const subscription = {
	getAllSubscriptions() {
		return {
			path: SUBSCRIPTION.GET,
			keys: () => [SUBSCRIPTION.GET] as const
		};
	}
};
