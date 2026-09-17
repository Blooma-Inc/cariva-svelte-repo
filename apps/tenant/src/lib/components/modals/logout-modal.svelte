<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		DialogContent,
		DialogHeader,
		DialogFooter
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';

	const { AppStore, AuthStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.LOGOUT_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.LOGOUT_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<DialogHeader>
			<Heading level="h2">Logout now</Heading>
			<Paragraph class="text-neutral-500!">Are you sure you want to logout ?</Paragraph>
		</DialogHeader>

		<DialogFooter>
			<Button size="lg" class="w-fit" disabled={AuthStore.loaders.isLogingOut} onclick={handleClose}
				>Stay Signed In</Button
			>

			<Button
				size="lg"
				variant="destructive"
				class="w-fit"
				disabled={AuthStore.loaders.isLogingOut}
				onclick={() => {
					AuthStore.logout(handleClose);
				}}
			>
				{AuthStore.loaders.isLogingOut ? 'Signing Out' : 'Log out'}
			</Button>
		</DialogFooter>
	</DialogContent>
</DialogModal>
