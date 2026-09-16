<script lang="ts">
	import FallbackDashboard from './fallback-dashboard.svelte';
	import TenantAdminDashboard from './tenant-admin-dashboard.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { ROLES, type Role } from '$lib/configs/roles';
	import BranchAdminDashboard from './branch-admin-dashboard.svelte';

	let { AuthStore } = stores;

	const dashboardMap = {
		[ROLES.TENANT_ADMIN]: TenantAdminDashboard,
		[ROLES.BRANCH_ADMIN]: BranchAdminDashboard
	};

	let ActiveDashboard = $derived.by(() => {
		const roleDashboard = Object.entries(dashboardMap).find(([name, component]) => {
			if (AuthStore.user.roles && AuthStore.active_role !== null) {
				const role = AuthStore.user.roles.at(AuthStore.active_role) as Role;
				if (role == name) {
					return component;
				}
			}
		});

		return roleDashboard?.[1] || FallbackDashboard;
	});
</script>

<ActiveDashboard />
