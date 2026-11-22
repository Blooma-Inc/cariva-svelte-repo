export const AUTH = {
	LOGIN: '/auth/platform/login',
	FORGOT_PWD: '/auth/forgot-password',
	RESET_PWD: '/auth/reset-password',
	VERIFY_EMAIL: '/auth/verify-email',
	RESEND_EMAIL: '/auth/resend-email-verification',
	VERIFY_ACCT: '/auth/verify-account',
	CHANGE_PWD: '/auth/change-password',
	ACTIVE_SESSION: '/auth/sessions',
	NEW_ACCESS_TOKEN: '/auth/refresh',
	CURRENT_USER: '/auth/current-user',
	LOGOUT: '/auth/logout',
	LOGOUT_ALL: '/auth/logout-all'
} as const;

export const TENANT = {
	SUGGEST_CODE: '/tenant/suggest-code',
	TENANCY_REQUEST: '/platform/tenancy-request',
	ACTIVATE_TENANT: '/platform/activate-tenant',
	REJECT_TENANT: '/platform/reject-tenant',
	TENANTS: '/platform/tenants',
	STATS: '/platform/tenant/:uid/stats',
	ADMIN: '/platform/tenant/:uid/admin',
	DETAILS: '/platform/tenant/:uid/details',
	BRANCHES: '/platform/tenant/:uid/branches'
};

export const SUBSCRIPTION = {
	GET: '/subscription',
	CREATE: '/subscription',
	UPDATE: '/subscription/:uid'
};

export const USER = {
	PROFILE: '/user/profile'
};

export const TFA = {
	GET_2FA: '/tfa',
	SETUP_2FA: '/tfa/setup',
	ENABLE_2FA: '/tfa/enable',
	DISABLE_2FA: '/tfa/disable',
	VERIFY_TOTP_2FA: '/tfa/verify/totp',
	VERIFY_CODE_2FA: '/tfa/verify/code'
};

export const PERMISSIONS = {
	ME: '/permissions/me'
} as const;
