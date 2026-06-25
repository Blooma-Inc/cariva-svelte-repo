export const AUTH = {
	LOGIN: '/platform/login',
	FORGOT_PWD: '/forgot-password',
	RESET_PWD: '/reset-password',
	VERIFY_ACCT: '/verify-account',
	CHANGE_PWD: '/change-password',
	SETUP_2FA: '/2fa/setup',
	ENABLE_2FA: '/2fa/enable',
	DISABLE_2FA: '/2fa/disable',
	VERIFY_TOTP_2FA: '/2fa/verify/totp',
	VERIFY_CODE_2FA: '/2fa/verify/code',
	ACTIVE_SESSION: '/sessions',
	NEW_ACCESS_TOKEN: '/refresh',
	CURRENT_USER: '/current-user',
	LOGOUT: '/logout',
	LOGOUT_ALL: '/logout'
} as const;

export const PLATFORM = {
	TENANCY_REQUEST: '/tenancy-request',
	ACTIVATE_TENANT: '/activate-tenant',
	REJECT_TENANT: '/reject-tenant'
} as const;
