import { TFA } from '$lib/constants/api';

export const tfa = {
	get2FA() {
		return {
			path: TFA.GET_2FA,
			keys: () => [TFA.GET_2FA] as const
		};
	}
};
