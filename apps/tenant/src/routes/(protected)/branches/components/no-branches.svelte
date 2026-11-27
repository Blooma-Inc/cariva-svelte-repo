<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	const { AppStore, PermissionStore } = stores;
</script>

<EmptyState
	title="No branches yet"
	description="Create your first branch to set up your hospital locations."
	icon={Building2}
	actionLabel="Create branch"
	onAction={PermissionStore.can(PERMISSIONS.BRANCHES_CREATE)
		? () => AppStore.toggleModals({ open: true, name: AppModals.BRANCH_FORM_MODAL, branch_uid: '' })
		: undefined}
/>
