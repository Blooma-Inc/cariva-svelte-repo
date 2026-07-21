import { resolve } from '$app/paths';
import { goto } from '$app/navigation';
import ROUTES from '$lib/configs/routes.svelte';
import {
	getCurrentUser,
	postLogout,
	postLogoutAll,
	getNewAccessToken,
	postLogin
} from '$lib/requests/auth';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import { toast } from '@cariva/ui/components/toast/index.js';
import type { TAuthSchema, TLoginSchema } from '../../../routes/auth/validator';
import { AppModals } from '../app/modal-types';
import type { RootStore } from '../index.svelte';

const INIT_IS_LOADING = {
	isLogingIn: false,
	isLogingOut: false,
	isRefreshing: false
};

class AuthStore {
	rootStore: RootStore;

	accessToken = $state<string>('');
	refreshPromise: Promise<string> | null = $state(null);
	user = $state<Partial<UserItem>>({});
	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	async grantAccess(data: CarivaServerResp<TAuthSchema>, cb?: (url?: string) => void) {
		const result = data.data.result;
		const _accessToken = data.data.access_token;
		switch (result) {
			case 'success': {
				this.accessToken = _accessToken;
				const { data: userData } = await getCurrentUser();
				this.user = userData.data;
				cb?.();
				toast.success('Sucessful!');
				break;
			}
			case 'account_inactive':
				this.rootStore.AppStore.toggleModals({
					open: true,
					name: AppModals.DEACTIVATED_ACCOUNT_MODAL
				});
				break;
			case 'email_not_verified':
				// show email not verified modal
				this.rootStore.AppStore.toggleModals({
					open: true,
					name: AppModals.TFA_VERIFICATION_MODAL
				});
				break;
			case 'account_locked':
				this.rootStore.AppStore.toggleModals({
					open: true,
					name: AppModals.ACCOUNT_LOCKED_MODAL,
					remaining_time_in_seconds: data.meta as unknown as number
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
			default:
				toast.info('Unknown error.');
		}
	}

	async login(payload: TLoginSchema, cb: () => void) {
		this.loaders.isLogingIn = true;
		this.errors.isLogingIn = '';
		try {
			const { data } = (await postLogin(payload)) as { data: CarivaServerResp<TAuthSchema> };
			await this.grantAccess(data, cb);
		} catch (error) {
			this.errors.isLogingIn = parseError(error);
			toast.error(this.errors.isLogingIn);
		} finally {
			this.loaders.isLogingIn = false;
		}
	}

	async fetchNewToken() {
		if (this.refreshPromise) return this.refreshPromise;

		this.loaders.isRefreshing = true;
		this.refreshPromise = (async () => {
			try {
				const { data } = (await getNewAccessToken()) as { data: CarivaServerResp<TAuthSchema> };
				this.accessToken = data.data.access_token;
				return data.data.access_token;
			} catch (error) {
				this.errors.isRefreshing = parseError(error);
				throw error;
			} finally {
				this.loaders.isRefreshing = false;
				this.refreshPromise = null;
			}
		})();

		return this.refreshPromise;
	}

	async bootstrap() {
		try {
			await this.fetchNewToken();
			const { data } = await getCurrentUser();
			this.user = data.data;
		} catch {
			goto(resolve(ROUTES.LOGIN.path), { replaceState: true });
		}
	}

	async logout(cb?: () => void) {
		try {
			await postLogout();
			this.rootStore.AppStore.toggleModals({});
			cb?.();
			goto(resolve(ROUTES.LOGIN.path), { replaceState: true });
		} catch (error) {
			this.errors.isLogingOut = parseError(error);
		} finally {
			this.accessToken = '';
			this.user = {};
			goto(resolve(ROUTES.LOGIN.path));
		}
	}

	async logoutAll() {
		try {
			await postLogoutAll();
			goto(resolve(ROUTES.LOGIN.path), { replaceState: true });
		} catch (error) {
			this.errors.isLogingOut = parseError(error);
		} finally {
			this.accessToken = '';
			this.user = {};
			goto(resolve(ROUTES.LOGIN.path));
		}
	}
}

export default AuthStore;
