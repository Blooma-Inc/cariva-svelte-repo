<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent, CardFooter } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { ResetPasswordSchema } from '../../validator';
	import { stores } from '$lib/store/index.svelte';
	import { goto } from '$app/navigation';
	import ROUTES from '$lib/configs/routes.svelte';

	const { data } = $props();
	const { AuthStore } = stores;
	const getToken = () => data.token;

	const form = superForm(
		{ token: getToken(), new_password: '', confirm_password: '' },
		{
			SPA: true,
			resetForm: false,
			validators: zod4Client(ResetPasswordSchema),
			onUpdated: async ({ form }) => {
				if (form.valid) {
					AuthStore.resetPwd(form.data, () => {
						goto(ROUTES.LOGIN.resolve());
					});
				}
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<div class="flex flex-col gap-3">
	<div>
		<Heading level="h2" class="text-primary!">Create a new password</Heading>
		<Paragraph muted>Your new password must meet Cariva’s security requirements.</Paragraph>
	</div>

	<Card class="w-full">
		<CardContent>
			<form id="reset-password-form" use:enhance>
				<fieldset class="flex flex-col gap-2">
					<FormField {form} name="new_password">
						<InputField
							label="New password"
							bind:value={$formData.new_password}
							required
							type="password"
						/>
					</FormField>

					<FormField {form} name="confirm_password">
						<InputField
							label="Confirm password"
							bind:value={$formData.confirm_password}
							required
							type="password"
						/>
					</FormField>
				</fieldset>
			</form>
		</CardContent>

		<CardFooter>
			<Button type="submit" form="reset-password-form" size="lg" class="w-full"
				>Set New Password</Button
			>
		</CardFooter>
	</Card>
</div>
