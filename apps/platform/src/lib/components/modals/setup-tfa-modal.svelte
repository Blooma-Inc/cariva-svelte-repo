<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { DialogContent, DialogFooter } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { qr } from '@svelte-put/qr/svg';

	const { AppStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.SETUP_TFA_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.SETUP_TFA_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<div class="flex flex-col items-center justify-center gap-3 rounded-xl">
			<div class="text-center">
				<Heading level="h1" class="text-primary!">Set-up 2FA</Heading>
				<Paragraph class=" text-neutral-500!">Install an authenticator app.</Paragraph>
			</div>

			<Paragraph size="sm" class=" text-neutral-500!">Scan QR Code.</Paragraph>
			<Card>
				<CardContent>
					<div class="flex flex-col items-center justify-center">
						<svg
							width={200}
							height={200}
							use:qr={{
								data: AppStore.tfaModal.qr_code_url,
								shape: 'circle'
							}}
						/>
					</div>
				</CardContent>
			</Card>

			<div class="text-center">
				<Paragraph size="sm" class=" text-neutral-500!">
					Use Google Authenticator, Authy, or another compatible app on your mobile device.
				</Paragraph>
			</div>

			<DialogFooter class="pt-3">
				<Button
					size="lg"
					onclick={() => {
						AppStore.toggleModals({ open: true, name: AppModals.ENABLE_TFA_MODAL });
						handleClose();
					}}>I have scanned the QR code</Button
				>
			</DialogFooter>
		</div>
	</DialogContent>
</DialogModal>
