<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { DialogContent, DialogHeader } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';

	const { AppStore, AuthStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.SESSION_TIMEOUT_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.SESSION_TIMEOUT_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<DialogHeader>
			<Heading level="h2" class="text-red-600!">Session expiring soon</Heading>
			<Paragraph class="text-neutral-500!">
				You’ve been inactive for a while. For security reasons, your session will expire soon.
			</Paragraph>
		</DialogHeader>

		<div class="flex flex-col items-center gap-3 rounded-xl">
			<Paragraph muted balance>Sining out in 00:24</Paragraph>

			<div class="flex items-center justify-between">
				<Button
					size="lg"
					variant="destructive"
					class="w-[48%]"
					disabled={AuthStore.loaders.isLogingOut}
					isLoading={AuthStore.loaders.isLogingOut}
					onclick={() => {
						AuthStore.logout(handleClose);
					}}
				>
					Sign Out
				</Button>
				<Button
					size="lg"
					class="w-[48%]"
					disabled={AuthStore.loaders.isLogingOut}
					onclick={handleClose}>Stay Signed In</Button
				>
			</div>
		</div>
	</DialogContent>
</DialogModal>
