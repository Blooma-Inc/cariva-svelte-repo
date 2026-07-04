import { Mangle } from '$lib/constants/mangle';
import { postLogin } from '$lib/requests/auth';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import type { TAuthSchema, TLoginSchema } from '../../../routes/auth/validator';
import { AppModals } from '../app/modalTypes';
import type { RootStore } from '../index.svelte';
import store from 'store2';

const persist = <T = string>(key: string, value: T) => {
	store.namespace('auth').local.set(key, value);
	return value;
};

const get = <T = string>(key: string, fallback?: T) => {
	return store.namespace('auth').local.get(key, fallback) as T;
};

// const del = (key: string) => {
// 	return store.namespace('auth').local.remove(key);
// };

const INIT_IS_LOADING = {
	login: false,
	logout: false,
	refresh: false
};

class AuthStore {
	rootStore: RootStore;

	accessToken = $state(get(Mangle.AUTH_TOKEN));
	user = $state(get<Partial<UserItem>>(Mangle.AUTH_USER, {}));
	isLoading = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.isLoading, ''));

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	isAuthenticated(): TIsAuthenticated {
		return { ttl: 0, token: '', email: '' };
	}

	grantAccess(_accessToken: string, cb?: (url?: string) => void) {
		this.accessToken = persist(Mangle.AUTH_TOKEN, _accessToken);
		cb?.();
	}

	*login(payload: TLoginSchema, cb: () => void) {
		this.isLoading.login = true;
		this.errors.login = '';
		try {
			const {
				data: { data }
			} = (yield postLogin(payload)) as { data: CarivaServerResp<TAuthSchema> };
			const result = data.result;

			switch (result) {
				case 'success':
					this.grantAccess(data.access_token, cb);
					break;
				case 'account_inactive':
					this.rootStore.AppStore.toggleModals({
						open: true,
						name: AppModals.DEACTIVATED_ACCOUNT_MODAL
					});
					break;
				case 'email_not_verified':
					// show email not verified modal
					break;
				case 'account_locked':
					this.rootStore.AppStore.toggleModals({
						open: true,
						name: AppModals.ACCOUNT_LOCKED_MODAL
					});
					break;
				case 'requires_2fa':
					this.rootStore.AppStore.toggleModals({
						open: true,
						name: AppModals.TFA_VERIFICATION_MODAL
					});
					break;
				case 'requires_password_reset':
					// show password reset modal
					break;
			}
		} catch (error) {
			parseError(error);
		}
	}
	async getTokenFromCookie() {}
	async fetchNewToken() {
		return '';
	}
	async logout() {}
	async logoutAll() {}
}

export default AuthStore;
