<script lang="ts">
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { SheetContent, SheetHeader } from '@cariva/ui/components/ui/sheet/index.js';
	import { AppModals } from '$lib/store/app/modal-types';
	// import PermissionsOverrideForm from '$lib/components/permissions-override-form/index.svelte';

	const { AppStore } = stores;
	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.STAFF_PERMISSION_OVERRIDE_MODAL, open: false });
	};
</script>

<SheetModal isOpen={AppStore.isOpen.STAFF_PERMISSION_OVERRIDE_MODAL} closeModal={handleClose}>
	<SheetContent
		side="left"
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
		class="flex h-svh w-full! max-w-xl! flex-col overflow-clip "
	>
		<SheetHeader class="border">
			<Heading level="h3">Permission Matrix</Heading>
		</SheetHeader>

		<!-- <section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			<PermissionsOverrideForm user_uid={AppStore.userModal.user_uid} />
		</section> -->
	</SheetContent>
</SheetModal>
