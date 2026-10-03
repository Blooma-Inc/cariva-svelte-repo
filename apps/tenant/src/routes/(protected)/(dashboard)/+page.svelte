<script lang="ts">
	import FallbackDashboard from './components/fallback-dashboard.svelte';
	import TenantAdminDashboard from './tenant-admin/index.svelte';
	import BranchAdminDashboard from './branch-admin/index.svelte';
	import ReceptionistDashboard from './receptionist/index.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { ROLES, type Role } from '$lib/configs/roles';

	let { AuthStore } = stores;

	const dashboardMap = {
		[ROLES.TENANT_ADMIN]: TenantAdminDashboard,
		[ROLES.BRANCH_ADMIN]: BranchAdminDashboard,
		[ROLES.RECEPTIONIST]: ReceptionistDashboard
	};

	const role = $derived.by(() => {
		if (AuthStore.user.user_roles && AuthStore.active_role !== null) {
			return AuthStore.user.user_roles.at(AuthStore.active_role)?.role.name as Role;
		}
		return '';
	});

	let ActiveDashboard = $derived.by(() => {
		const roleDashboard = Object.entries(dashboardMap).find(([name, component]) => {
			if (role === name) return component;
			return FallbackDashboard;
		});

		return roleDashboard?.[1];
	});
</script>

<ActiveDashboard />
