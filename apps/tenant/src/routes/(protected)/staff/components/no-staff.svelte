<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import UsersRound from '@lucide/svelte/icons/users-round';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	const { AppStore, PermissionStore } = stores;
</script>

<EmptyState
	title="No staff yet"
	description="Add your first staff member to start building your care team."
	icon={UsersRound}
	actionLabel="Add staff"
	onAction={PermissionStore.can(PERMISSIONS.STAFF_CREATE)
		? () => AppStore.toggleModals({ open: true, name: AppModals.STAFF_FORM_MODAL, user_uid: '' })
		: undefined}
/>
