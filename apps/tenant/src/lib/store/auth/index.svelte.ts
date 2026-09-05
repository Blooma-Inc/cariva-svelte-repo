import { goto } from '$app/navigation';
import { decodeJwt } from 'jose';
import ROUTES from '$lib/configs/routes.svelte';
import {
	getCurrentUser,
	postLogout,
	postLogoutAll,
	getNewAccessToken,
	postLogin,
	postVerify2FATOTP,
	getSetup2FA,
	postEnable2FA,
	postVerifyEmail,
	postResendEmailVerification,
	postResetPwd
} from '$lib/requests/auth';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import { toast } from '@cariva/ui/components/toast/index.js';
import type { TAuthSchema, TLoginSchema, TResetPasswordSchema } from '$routes/auth/validator';
import { AppModals } from '../app/modal-types';
import type { RootStore } from '../index.svelte';
import type { EnableTFASchemaType } from '$lib/components/modals/enable-tfa-modal.svelte';
import type { TFAVerificationSchemaType } from '$lib/components/modals/tfa-verification-modal.svelte';
import store from 'store2';
import { Mangle } from '$lib/constants/mangle';
import type { UserProfileType } from '$routes/(protected)/profile/modals/profile-form-modal.svelte';
import { patchUpdateUser } from '$lib/requests/user';

const INIT_IS_LOADING = {
	isLogingIn: false,
	isLogingOut: false,
	isRefreshing: false,
	isUpdatingProfile: false,
	isEnablingTFA: false,
	isVerifyingEmail: false
};

const persist = <T = string>(key: string, value: T) => {
	store.namespace('auth').local.set(key, value);
	return value;
};

const get = <T = string>(key: string, fallback?: T) => {
	return store.namespace('auth').local.get(key, fallback) as T;
};

class AuthStore {
	rootStore: RootStore;

	accessToken = $state<string>('');
	active_role: number = $state(get<number>(Mangle.ACTIVE_USER_ROLE, 0));
	refreshPromise: Promise<string> | null = $state(null);
	userEmail: string = $state('');
	user = $state<Partial<AuthProfile>>({});
	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	async decodeToken(access_token: string) {
		const claims = decodeJwt<TokenModel>(access_token);
		this.user = {
			...this.user,
			roles: claims.user.roles,
			scope: claims.user.scope
		};
	}

	async grantAccess(data: CarivaServerResp<TAuthSchema>, cb?: (url?: string) => void) {
		const result = data.data.result;
		if (data.data.access_token) {
			this.accessToken = data.data.access_token;
		}
		switch (result) {
			case 'success': {
				const { data: userData } = await getCurrentUser();
				this.active_role = persist<number>(Mangle.ACTIVE_USER_ROLE, 0);
				this.user = userData.data;
				await this.decodeToken(this.accessToken);
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
			case 'email_not_verified': {
				this.rootStore.AppStore.toggleModals({
					open: true,
					name: AppModals.REQUEST_EMAIL_VERIFICATION_MODAL
				});
				break;
			}
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
				goto(ROUTES.RESET_PWD.resolve({ token: this.accessToken }));
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
			this.userEmail = payload.email;
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
			const access_token = await this.fetchNewToken();
			const { data } = await getCurrentUser();
			this.user = data.data;
			this.decodeToken(access_token);
		} catch {
			goto(ROUTES.LOGIN.resolve(), { replaceState: true });
		}
	}

	async logout(cb?: () => void) {
		try {
			await postLogout();
			this.rootStore.AppStore.toggleModals({});
			cb?.();
			goto(ROUTES.LOGIN.resolve(), { replaceState: true });
		} catch (error) {
			this.errors.isLogingOut = parseError(error);
		} finally {
			this.accessToken = '';
			this.user = {};
			goto(ROUTES.LOGIN.resolve());
		}
	}

	async logoutAll() {
		try {
			await postLogoutAll();
			goto(ROUTES.LOGIN.resolve(), { replaceState: true });
		} catch (error) {
			this.errors.isLogingOut = parseError(error);
		} finally {
			this.accessToken = '';
			this.user = {};
			goto(ROUTES.LOGIN.resolve());
		}
	}

	async updateUser(payload: Partial<UserProfileType>, cb?: () => void) {
		this.loaders.isUpdatingProfile = true;
		this.errors.isUpdatingProfile = '';
		try {
			const { data } = (await patchUpdateUser(payload)) as { data: CarivaServerResp<boolean> };
			toast.success(data.message);
			cb?.();
		} catch (error) {
			this.errors.isUpdatingProfile = parseError(error);
			toast.error(this.errors.isUpdatingProfile);
		} finally {
			this.loaders.isUpdatingProfile = false;
		}
	}

	async setup2FA() {
		this.loaders.isEnablingTFA = true;
		this.errors.isEnablingTFA = '';
		try {
			const { data } = (await getSetup2FA()) as { data: CarivaServerResp<Enable2FA> };
			toast.success(data.message);
			this.rootStore.AppStore.toggleModals({
				open: true,
				name: AppModals.SETUP_TFA_MODAL,
				qr_code_url: data.data.qr_code_url
			});
		} catch (error) {
			this.errors.isEnablingTFA = parseError(error);
			toast.error(this.errors.isEnablingTFA);
		} finally {
			this.loaders.isEnablingTFA = false;
		}
	}

	async enable2FA(payload: EnableTFASchemaType, cb?: () => void) {
		this.loaders.isEnablingTFA = true;
		this.errors.isEnablingTFA = '';
		try {
			const { data } = (await postEnable2FA(payload)) as { data: CarivaServerResp<Array<string>> };
			toast.success(data.message);
			cb?.();
			this.rootStore.AppStore.toggleModals({
				open: true,
				name: AppModals.TFA_BACKUP_CODES,
				codes: data.data.join(' ')
			});
		} catch (error) {
			this.errors.isEnablingTFA = parseError(error);
			toast.error(this.errors.isEnablingTFA);
		} finally {
			this.loaders.isEnablingTFA = false;
		}
	}

	async verifyTFATOTP(payload: TFAVerificationSchemaType, cb?: () => void) {
		this.loaders.isLogingIn = true;
		this.errors.isLogingIn = '';
		try {
			const { data } = (await postVerify2FATOTP(payload, this.accessToken)) as {
				data: CarivaServerResp<TAuthSchema>;
			};
			await this.grantAccess(data, cb);
		} catch (error) {
			this.errors.isLogingIn = parseError(error);
			toast.error(this.errors.isLogingIn);
		} finally {
			this.loaders.isLogingIn = false;
		}
	}

	async verifyEmail(token: string, cb?: () => void) {
		this.loaders.isVerifyingEmail = true;
		this.errors.isVerifyingEmail = '';
		try {
			const { data } = (await postVerifyEmail(token)) as { data: CarivaServerResp<boolean> };
			toast.success(data.message);
			cb?.();
			return true;
		} catch (error) {
			this.errors.isVerifyingEmail = parseError(error);
			toast.error(this.errors.isVerifyingEmail);

			return false;
		} finally {
			this.loaders.isVerifyingEmail = false;
		}
	}

	async resendEmailVerification(cb?: () => void) {
		this.loaders.isVerifyingEmail = true;
		this.errors.isVerifyingEmail = '';
		try {
			const { data } = (await postResendEmailVerification(this.userEmail)) as {
				data: CarivaServerResp<boolean>;
			};
			toast.success(data.message);
			cb?.();
		} catch (error) {
			this.errors.isVerifyingEmail = parseError(error);
			toast.error(this.errors.isVerifyingEmail);
		} finally {
			this.loaders.isVerifyingEmail = false;
		}
	}

	async resetPwd(payload: TResetPasswordSchema, cb: () => void) {
		this.loaders.isVerifyingEmail = true;
		this.errors.isVerifyingEmail = '';
		try {
			const { data } = (await postResetPwd(payload)) as {
				data: CarivaServerResp<boolean>;
			};
			toast.success(data.message);
			cb?.();
		} catch (error) {
			this.errors.isVerifyingEmail = parseError(error);
			toast.error(this.errors.isVerifyingEmail);
		} finally {
			this.loaders.isVerifyingEmail = false;
		}
	}
}

export default AuthStore;
