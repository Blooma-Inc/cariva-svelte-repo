export const AUTH = {
	LOGIN: '/auth/platform/login',
	FORGOT_PWD: '/auth/forgot-password',
	RESET_PWD: '/auth/reset-password',
	VERIFY_ACCT: '/auth/verify-account',
	CHANGE_PWD: '/auth/change-password',
	SETUP_2FA: '/auth/2fa/setup',
	ENABLE_2FA: '/auth/2fa/enable',
	DISABLE_2FA: '/auth/2fa/disable',
	VERIFY_TOTP_2FA: '/auth/2fa/verify/totp',
	VERIFY_CODE_2FA: '/auth/2fa/verify/code',
	ACTIVE_SESSION: '/auth/sessions',
	NEW_ACCESS_TOKEN: '/auth/refresh',
	CURRENT_USER: '/auth/current-user',
	LOGOUT: '/auth/logout',
	LOGOUT_ALL: '/auth/logout-all'
} as const;

export const PLATFORM = {
	TENANCY_REQUEST: '/platform/tenancy-request',
	ACTIVATE_TENANT: '/platform/activate-tenant',
	REJECT_TENANT: '/platform/reject-tenant'
} as const;

export const SUBSCRIPTION = {
	GET: '/subscription',
	CREATE: '/subscription',
	UPDATE: '/subscription/:uid'
};
