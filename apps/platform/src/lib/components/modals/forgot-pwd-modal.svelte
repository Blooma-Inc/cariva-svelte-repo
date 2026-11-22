<script lang="ts" module>
	import { z } from 'zod';
	import { email } from '$lib/validators';

	export const ForgotPwdSchema = z.object({
		email
	});
</script>

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
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	const { AppStore, AuthStore } = stores;

	const form = superForm(
		{ email: '' },
		{
			SPA: true,
			resetForm: false,
			validators: zod4Client(ForgotPwdSchema),
			onUpdated: async ({ form }) => {
				if (form.valid) {
					await AuthStore.forgotPwd(form.data.email, handleClose);
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.FORGOT_PWD_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.FORGOT_PWD_MODAL} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<DialogHeader>
			<Heading level="h1">Secure Password Recovery</Heading>
			<Paragraph class="text-neutral-500!">
				Enter your email address to receive a secure reset link.
			</Paragraph>
		</DialogHeader>

		<div class="flex flex-col gap-3 rounded-xl">
			<form use:enhance class="flex flex-col gap-3">
				<fieldset
					disabled={AuthStore.loaders.isRequestingPasswordReset}
					class="flex flex-col gap-3"
				>
					<FormField {form} name="email">
						<InputField
							label="Work Email Address"
							placeholder="Enter your work email"
							bind:value={$formData.email}
							required
						/>
					</FormField>
				</fieldset>

				<Button
					disabled={AuthStore.loaders.isRequestingPasswordReset}
					isLoading={AuthStore.loaders.isRequestingPasswordReset}
					size="lg"
					type="submit"
					class="w-fit">Send Reset Link</Button
				>
			</form>

			<DialogFooter class="border-t pt-3">
				<div class="flex w-full justify-start">
					<Button size="lg" type="button" variant="secondary" onclick={handleClose}>
						<ArrowLeftIcon class="size-3" />
						Back to login
					</Button>
				</div>
			</DialogFooter>
		</div>
	</DialogContent>
</DialogModal>
