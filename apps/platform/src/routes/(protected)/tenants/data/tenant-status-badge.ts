export enum TenantStatusEnum {
	ONBOARDING = 'onboarding',
	ACTIVE = 'active',
	SUSPENDED = 'suspended',
	REJECTED = 'rejected'
}

export const tenantStatusBadge = new Map<string, string>([
	['onboarding', 'bg-info text-white hover:bg-info hover:text-white'],
	['active', 'bg-primary text-white hover:bg-primary hover:text-white'],
	['rejected', 'bg-destructive text-white hover:bg-destructive hover:text-white'],
	['suspended', 'bg-warning text-white hover:bg-warning hover:text-white']
]);
