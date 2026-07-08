<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/inputField/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { LoginSchema } from '../validator.js';
	import { stores } from '$lib/store/index.svelte.js';
	import { AppModals } from '$lib/store/app/modalTypes';
	import ROUTES from '$lib/configs/routes.svelte.js';

	let { data } = $props();
	let { AuthStore, AppStore } = stores;

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		SPA: true,
		resetForm: false,
		validators: zod4Client(LoginSchema),
		onUpdated: async ({ form }) => {
			if (!form.valid) return;
			await AuthStore.login(form.data, () =>
				goto(resolve(ROUTES.DASHBOARD.path), { replaceState: true })
			);
		}
	});

	const { form: formData, enhance } = form;
</script>

<Card class="w-full">
	<CardHeader>
		<Heading level="h1">Login</Heading>
		<Paragraph muted>
			Sign in to securely access all hospital workspace and management tools.
		</Paragraph>
	</CardHeader>

	<CardContent>
		<Card class="shadow-none">
			<CardContent>
				<form id="login-form" use:enhance class="flex flex-col gap-3">
					<fieldset class="flex flex-col gap-2">
						<FormField {form} name="email">
							<InputField label="Email Address" bind:value={$formData.email} required />
						</FormField>

						<div class="flex flex-col items-end">
							<FormField {form} name="password" class="w-full">
								<InputField
									label="Password"
									bind:value={$formData.password}
									required
									type="password"
								/>
							</FormField>

							<button
								class="w-fit text-primary underline"
								type="button"
								onclick={() =>
									AppStore.toggleModals({
										open: true,
										name: AppModals.DEACTIVATED_ACCOUNT_MODAL
									})}>Forgot password ?</button
							>
						</div>
					</fieldset>

					<Button
						type="submit"
						form="login-form"
						size="lg"
						class="w-full"
						disabled={AuthStore.isLoading.login}
					>
						{AuthStore.isLoading.login ? 'Submitting...' : 'Login'}
					</Button>
				</form>
			</CardContent>
		</Card>
	</CardContent>
</Card>
