<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';

	const { AppStore, AuthStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.REQUEST_EMAIL_VERIFICATION_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.REQUEST_EMAIL_VERIFICATION_MODAL} closeModal={handleClose}>
	<DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
		<DialogHeader>
			<Heading level="h2">Verify Email</Heading>
			<Paragraph>Request new verification link in your inbox.</Paragraph>
		</DialogHeader>

		<DialogFooter>
			<Button
				class="w-full"
				size="lg"
				disabled={AuthStore.loaders.isVerifyingEmail}
				isLoading={AuthStore.loaders.isVerifyingEmail}
				onclick={() => {
					AuthStore.resendEmailVerification(handleClose);
				}}>Request new link</Button
			>
		</DialogFooter>
	</DialogContent>
</DialogModal>
