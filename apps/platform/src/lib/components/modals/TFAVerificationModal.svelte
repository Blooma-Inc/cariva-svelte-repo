<script lang="ts" module>
	import { z } from 'zod';

	export const TFAVerificationSchema = z.object({
		code: z.string({ error: 'Code is required' })
	});
</script>

<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modalTypes';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { ArrowLeftIcon } from '@cariva/ui/icons';
	import { InputField } from '@cariva/ui/components/form-inputs/inputField/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	const { AppStore } = stores;

	const form = superForm(
		{ code: '' },
		{
			SPA: true,
			resetForm: false,
			validators: zod4Client(TFAVerificationSchema),
			onUpdate: async ({ form }) => {
				console.log(form.data);
			}
		}
	);

	const { form: formData, enhance } = form;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.TFA_VERIFICATION_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.TFA_VERIFICATION_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<DialogHeader>
			<Heading level="h1" class="text-primary!">Additional Verification</Heading>
			<Heading level="h3" class="font-regular! text-neutral-500!">Enter authentication code</Heading
			>
		</DialogHeader>

		<div class="flex flex-col gap-3 rounded-xl">
			<form id="login-form" use:enhance>
				<fieldset class="w-3xs">
					<FormField {form} name="code">
						<InputField
							label=""
							placeholder="Enter 6-digit code"
							bind:value={$formData.code}
							required
						/>
					</FormField>
				</fieldset>
				<Paragraph size="sm" muted balance
					>Open your authenticator app and enter the 6-digit verification code.</Paragraph
				>
			</form>

			<div class="flex flex-col gap-2">
				<Button size="lg" class="w-fit">Verify now</Button>
				<Paragraph size="sm" muted balance>Code refreshes every 30 seconds</Paragraph>
			</div>

			<DialogFooter class="border-t pt-3">
				<div class="flex w-full justify-start">
					<Button size="lg" variant="secondary">
						<ArrowLeftIcon class="size-3" />
						Back to login
					</Button>
				</div>
			</DialogFooter>
		</div>
	</DialogContent>
</DialogModal>
