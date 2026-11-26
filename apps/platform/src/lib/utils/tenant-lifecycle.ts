export function tenantLifecycleActions(status: string): TenantLifecycleAction[] {
	if (status === 'onboarding') return ['activate', 'reject'];
	if (status === 'active') return ['suspend'];
	return [];
}
