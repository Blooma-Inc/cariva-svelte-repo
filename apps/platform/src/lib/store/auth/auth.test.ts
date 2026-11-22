import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeJwt } from 'jose';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$lib/configs/routes.svelte', () => ({
	default: {
		LOGIN: { resolve: () => '/auth/login' },
		RESET_PWD: { resolve: ({ token }: { token: string }) => `/auth/reset-password/${token}` }
	}
}));
vi.mock('@cariva/ui/components/toast/index.js', () => ({
	toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() }
}));
vi.mock('$lib/requests/auth', () => ({
	getCurrentUser: vi.fn(),
	getNewAccessToken: vi.fn(),
	postLogin: vi.fn(),
	postLogout: vi.fn(),
	postLogoutAll: vi.fn(),
	postVerify2FATOTP: vi.fn(),
	getSetup2FA: vi.fn(),
	postEnable2FA: vi.fn(),
	postVerifyEmail: vi.fn(),
	postResendEmailVerification: vi.fn(),
	postResetPwd: vi.fn(),
	postForgotPwd: vi.fn()
}));
vi.mock('$lib/requests/user', () => ({ patchUpdateUser: vi.fn() }));
vi.mock('jose', () => ({ decodeJwt: vi.fn() }));

import { goto } from '$app/navigation';
import {
	getCurrentUser,
	getNewAccessToken,
	postResetPwd,
	postResendEmailVerification
} from '$lib/requests/auth';
import { AppModals } from '../app/modal-types';
import type { RootStore } from '../index.svelte';
import AuthStore from './index.svelte';

function setup() {
	const root = { AppStore: { toggleModals: vi.fn() }, PermissionStore: { clear: vi.fn() } };
	return { root, store: new AuthStore(root as unknown as RootStore) };
}

const response = (result: string) => ({
	data: { result, access_token: 'token', is_email_verified: false },
	meta: null,
	message: '',
	status: 'success'
});

describe('platform authentication', () => {
	beforeEach(() => vi.resetAllMocks());

	it('restores role claims alongside the current profile', async () => {
		vi.mocked(getNewAccessToken).mockResolvedValue({ data: response('success') } as never);
		vi.mocked(getCurrentUser).mockResolvedValue({
			data: { data: { uid: 'user', profile_photo_url: 'photo' } }
		} as never);
		vi.mocked(decodeJwt).mockReturnValue({
			user: { roles: ['platform_super_admin'], scope: 'platform' }
		});
		const { store } = setup();
		await store.bootstrap();
		expect(store.user).toMatchObject({
			uid: 'user',
			profile_photo_url: 'photo',
			roles: ['platform_super_admin'],
			scope: 'platform'
		});
	});

	it('clears stale state and rejects when restoring the profile fails', async () => {
		vi.mocked(getNewAccessToken).mockResolvedValue({ data: response('success') } as never);
		vi.mocked(getCurrentUser).mockRejectedValue(new Error('expired'));
		const { store, root } = setup();
		await expect(store.bootstrap()).rejects.toThrow('expired');
		expect(store.accessToken).toBe('');
		expect(store.user).toEqual({});
		expect(root.PermissionStore.clear).toHaveBeenCalledOnce();
	});

	it('opens email verification instead of the two-factor modal', async () => {
		const { store, root } = setup();
		await store.grantAccess(response('email_not_verified') as never);
		expect(root.AppStore.toggleModals).toHaveBeenCalledWith({
			open: true,
			name: AppModals.REQUEST_EMAIL_VERIFICATION_MODAL
		});
	});

	it('opens the reset link for a required password change', async () => {
		const { store } = setup();
		await store.grantAccess(response('requires_password_reset') as never);
		expect(goto).toHaveBeenCalledWith('/auth/reset-password/token');
	});

	it('keeps the reset form available when the token is rejected', async () => {
		vi.mocked(postResetPwd).mockRejectedValue(new Error('Invalid token'));
		const { store } = setup();
		const onSuccess = vi.fn();
		await store.resetPwd(
			{ token: 'expired', new_password: 'password', confirm_password: 'password' },
			onSuccess
		);
		expect(onSuccess).not.toHaveBeenCalled();
		expect(store.errors.isResettingPassword).toBe('Invalid token');
		expect(store.loaders.isResettingPassword).toBe(false);
	});

	it('resends verification using the login email', async () => {
		vi.mocked(postResendEmailVerification).mockResolvedValue({
			data: { message: 'Sent' }
		} as never);
		const { store } = setup();
		store.userEmail = 'theo@example.com';
		await store.resendEmailVerification();
		expect(postResendEmailVerification).toHaveBeenCalledWith('theo@example.com');
		expect(store.loaders.isVerifyingEmail).toBe(false);
	});
});
