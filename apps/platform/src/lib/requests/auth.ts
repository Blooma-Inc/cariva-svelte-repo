import type { EnableTFASchemaType } from '$lib/components/modals/enable-tfa-modal.svelte';
import type { TFAVerificationSchemaType } from '$lib/components/modals/tfa-verification-modal.svelte';
import { AUTH, TFA } from '$lib/constants/api';
import type {
	TAuthSchema,
	TChangePasswordSchema,
	TTFACodeSchema,
	TLoginSchema,
	TResetPasswordSchema
} from '../../routes/auth/validator';
import server, { serverwithoutInterceptor } from './index';

export const postLogin = async (payload: TLoginSchema) =>
	await server.post<CarivaServerResp<TAuthSchema, number | null>>(AUTH.LOGIN, payload);

export const postForgotPwd = async (payload: { email: string }) =>
	await server.post<CarivaServerResp<boolean>>(AUTH.FORGOT_PWD, payload);

export const postResetPwd = async (payload: TResetPasswordSchema) =>
	await server.post<CarivaServerResp<boolean>>(AUTH.RESET_PWD, payload);

export const postVerifyAcct = async (payload: { email: string }) =>
	await server.post<CarivaServerResp<boolean>>(AUTH.VERIFY_ACCT, payload);

export const postVerifyEmail = async (token: string) =>
	await server.post<CarivaServerResp<boolean>>(AUTH.VERIFY_EMAIL, { token });

export const postResendEmailVerification = async (email: string) =>
	await server.post<CarivaServerResp<boolean>>(AUTH.RESEND_EMAIL, { email });

export const postChangePwd = async (payload: TChangePasswordSchema) =>
	await server.post<CarivaServerResp<boolean>>(AUTH.CHANGE_PWD, payload);

export const getSetup2FA = async () => await server.get<CarivaServerResp<Enable2FA>>(TFA.SETUP_2FA);

export const postEnable2FA = async (payload: EnableTFASchemaType) =>
	await server.post<CarivaServerResp<Array<string>>>(TFA.ENABLE_2FA, payload);

export const postDisable2FA = async (payload: TTFACodeSchema) =>
	await server.post<CarivaServerResp<boolean>>(TFA.DISABLE_2FA, payload);

export const postVerify2FATOTP = async (payload: TFAVerificationSchemaType, token: string) =>
	await server.post<CarivaServerResp<TAuthSchema>>(TFA.VERIFY_TOTP_2FA, payload, {
		headers: { Authorization: `Bearer ${token}` }
	});

export const postVerify2FACode = async (payload: TTFACodeSchema) =>
	await server.post<CarivaServerResp<TAuthSchema>>(TFA.VERIFY_CODE_2FA, payload);

export const postLogout = async () => await server.post<CarivaServerResp<boolean>>(AUTH.LOGOUT);

export const postLogoutAll = async () =>
	await server.post<CarivaServerResp<boolean>>(AUTH.LOGOUT_ALL);

export const getActiveSessions = async () =>
	await server.get<CarivaServerResp<Array<SessionItem>>>(AUTH.ACTIVE_SESSION);

export const getNewAccessToken = async () =>
	await serverwithoutInterceptor.get<CarivaServerResp<TAuthSchema>>(AUTH.NEW_ACCESS_TOKEN);

export const getCurrentUser = async () =>
	await server.get<CarivaServerResp<UserItem>>(AUTH.CURRENT_USER);
