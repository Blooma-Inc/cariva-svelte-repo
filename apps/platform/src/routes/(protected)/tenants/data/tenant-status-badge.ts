export enum TenantStatusEnum {
	ONBOARDING = 'onboarding',
	ACTIVE = 'active',
	SUSPENDED = 'suspended',
	REJECTED = 'rejected'
}

export const tenantStatusBadge = new Map<string, string>([
	['onboarding', 'info'],
	['active', 'default'],
	['rejected', 'destructive'],
	['suspended', 'warning']
]);
