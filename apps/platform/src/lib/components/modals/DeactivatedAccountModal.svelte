<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modalTypes';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { DialogContent, DialogHeader } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	const { AppStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.DEACTIVATED_ACCOUNT_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.DEACTIVATED_ACCOUNT_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<DialogHeader>
			<Heading level="h1" class="text-warning!">Deactivated Account</Heading>
			<Paragraph class="text-neutral-500!">Your account is currently inactive.</Paragraph>
		</DialogHeader>

		<div class="flex flex-col gap-3 rounded-xl border p-4">
			<Paragraph size="sm" muted>
				Please contact your Branch Administrator for assistance.
			</Paragraph>

			<div class="w-full border-t pt-3">
				<Button size="lg" class="w-fit" variant="secondary" onclick={handleClose}>
					<ArrowLeftIcon class="size-3" />
					Back to login
				</Button>
			</div>
		</div>
	</DialogContent>
</DialogModal>
