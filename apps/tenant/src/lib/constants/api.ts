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
} as const;

export const USER = {
	PROFILE: '/user/profile'
} as const;

export const TFA = {
	GET_2FA: '/tfa',
	SETUP_2FA: '/tfa/setup',
	ENABLE_2FA: '/tfa/enable',
	DISABLE_2FA: '/tfa/disable',
	VERIFY_TOTP_2FA: '/tfa/verify/totp',
	VERIFY_CODE_2FA: '/tfa/verify/code'
} as const;

export const TENANT = {
	CURRENT_TENANT: '/tenant',
	STATS: '/tenant/stats',
	BRANCHES: '/tenant/branches',
	USERS: '/tenant/users'
} as const;

export const BRANCH = {
	NEW: '/branch',
	SINGLE: '/branch/:uid'
} as const;

export const STAFF = {
	ALL: '/staff',
	ADD: '/staff/add',
	SINGLE: '/staff/:uid',
	IN_BRANCH: '/staff/branch/:branch_uid',
	RESET_PWD: '/staff/reset-pwd'
} as const;

export const ROLES = {
	ALL: '/role',
	PERMISSIONS: '/role/:uid/permissions',
	PERMISSION_MATRIX: '/role/permission/matrix'
} as const;

export const PERMISSIONS = {
	CATALOG: '/permissions/catalog',
	ME: '/permissions/me',
	OVERRIDE: '/permissions/override',
	REMOVE_OVERRIDE: '/permissions/remove-override/:uid'
} as const;
