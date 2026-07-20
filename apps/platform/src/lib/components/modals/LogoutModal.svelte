<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modalTypes';
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
			<Heading level="h1" class="text-red-600!">Logout now</Heading>
			<Paragraph class="text-neutral-500!">Are you sure you want to logout ?</Paragraph>
		</DialogHeader>

		<DialogFooter>
			<Button
				size="lg"
				variant="destructive"
				class="w-[48%]"
				disabled={AuthStore.loaders.isLogingOut}
				onclick={() => {
					AuthStore.logout(handleClose);
				}}
			>
				{AuthStore.loaders.isLogingOut ? 'Signing Out' : 'Log out'}
			</Button>
			<Button
				size="lg"
				class="w-[48%]"
				disabled={AuthStore.loaders.isLogingOut}
				onclick={handleClose}>Stay Signed In</Button
			>
		</DialogFooter>
	</DialogContent>
</DialogModal>
