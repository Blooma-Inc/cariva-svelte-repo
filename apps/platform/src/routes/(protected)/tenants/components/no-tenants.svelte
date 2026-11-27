<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { AppModals } from '$lib/store/app/modal-types';
	const { AppStore, PermissionStore } = stores;
</script>

<EmptyState
	title="No tenants yet"
	description="Provision your first hospital to get started."
	icon={Building2}
	actionLabel="Provision tenant"
	onAction={PermissionStore.can(PERMISSIONS.TENANTS_CREATE)
		? () => AppStore.toggleModals({ open: true, name: AppModals.TENANT_FORM_MODAL, tenant_uid: '' })
		: undefined}
/>
