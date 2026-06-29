<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modalTypes';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { DialogContent, DialogHeader } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';

	const { AppStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.ACCOUNT_LOCKED_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.ACCOUNT_LOCKED_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<DialogHeader>
			<Heading level="h1" class="text-red-600!">Account Locked</Heading>
			<Paragraph class="text-neutral-500!">Your account has been temporarily locked.</Paragraph>
		</DialogHeader>

		<div class="flex flex-col gap-3 rounded-xl border p-4">
			<Paragraph size="sm" muted>
				Too many failed login attempts were detected. Try again in 15 minutes or contact your Branch
				Administrator.
			</Paragraph>

			<div class="flex flex-col gap-2">
				<Button size="lg" class="w-fit" disabled>Back to login</Button>
				<Paragraph muted balance>Retry in 14:04</Paragraph>
			</div>
		</div>
	</DialogContent>
</DialogModal>
