export const AUTH = {
	LOGIN: '/auth/login',
	FORGOT_PWD: '/auth/forgot-password',
	RESET_PWD: '/auth/reset-password',
	VERIFY_EMAIL: '/auth/verify-email',
	RESEND_EMAIL: '/auth/resend-email-verification',
	CHANGE_PWD: '/auth/change-password',
	ACTIVE_SESSION: '/auth/sessions',
	NEW_ACCESS_TOKEN: '/auth/refresh',
	CURRENT_USER: '/auth/current-user',
	LOGOUT: '/auth/logout',
	LOGOUT_ALL: '/auth/logout-all'
} as const;

export const SUBSCRIPTION = {
	GET: '/subscription'
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

export const TENANT = {
	CURRENT_TENANT: '/tenant',
	STATS: '/tenant/stats',
	BRANCHES: '/tenant/branches',
	USERS: '/tenant/users'
};

export const BRANCH = {
	NEW: '/branch',
	SINGLE: '/branch/:uid'
};

export const STAFF = {
	ALL: '/staff',
	ADD: '/staff/add',
	SINGLE: '/staff/:uid'
};

export const ROLES = {
	ALL: '/role'
};
