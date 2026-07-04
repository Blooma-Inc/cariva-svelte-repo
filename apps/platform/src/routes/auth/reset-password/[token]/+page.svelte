<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/inputField/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { ResetPasswordSchema } from '../../validator';

	const form = superForm(
		{ token: page.params.token, new_password: '', confirm_password: '' },
		{
			SPA: true,
			resetForm: false,
			validators: zod4Client(ResetPasswordSchema),
			onUpdated: async ({ form }) => {
				console.log(form.data);
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<Card class="w-full">
	<CardHeader>
		<Heading level="h1" class="text-primary!">Create a new password</Heading>
		<Paragraph muted>Your new password must meet Cariva’s security requirements.</Paragraph>
	</CardHeader>

	<CardContent>
		<Card class="">
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

					<Button type="submit" form="reset-password-form" size="lg" class="w-full"
						>Set New Password</Button
					>
				</form>
			</CardContent>
		</Card>
	</CardContent>
</Card>
