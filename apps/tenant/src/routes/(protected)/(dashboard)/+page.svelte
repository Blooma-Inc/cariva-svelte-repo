<script lang="ts">
	import FallbackDashboard from './fallback-dashboard.svelte';
	import TenantAdminDashboard from './tenant-admin-dashboard.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { EnumRole } from '$lib/configs/roles';

	let { AuthStore } = stores;

	const dashboardMap = {
		[EnumRole.TENANT_ADMIN]: TenantAdminDashboard
	};

	let ActiveDashboard = $derived.by(() => {
		const roleDashboard = Object.entries(dashboardMap).find(([name, component]) => {
			if (AuthStore.user.roles && AuthStore.active_role !== null) {
				const role = AuthStore.user.roles.at(AuthStore.active_role) as EnumRole;
				if (role == name) {
					return component;
				}
			}
		});

		return roleDashboard?.[1] || FallbackDashboard;
	});
</script>

<ActiveDashboard />
