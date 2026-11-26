import { decodeJwt } from 'jose';
import { PERMISSIONS } from '$lib/configs/permissions';
import type { RootStore } from '$lib/store/index.svelte';

export function canAccessBranchServices(
	root: Pick<RootStore, 'PermissionStore' | 'AuthStore' | 'AppStore'>,
	branchUid: string,
	permission = PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_READ as string
) {
	if (!branchUid || !root.AppStore.currentTenant.uid || !root.PermissionStore.can(permission))
		return false;
	try {
		const { user } = decodeJwt<{ user: { tenant_uid?: string; branch_uid?: string } }>(
			root.AuthStore.accessToken
		);
		return (
			user?.tenant_uid === root.AppStore.currentTenant.uid &&
			(user.branch_uid === branchUid || root.PermissionStore.can(PERMISSIONS.BRANCHES_MANAGE))
		);
	} catch {
		return false;
	}
}
