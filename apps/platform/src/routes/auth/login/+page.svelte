<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardFooter,
		CardHeader
	} from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/inputField/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { LoginSchema } from './validator';
	import { stores } from '$lib/store/index.svelte.js';

	let { data } = $props();
	let { AuthStore } = stores;

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		SPA: true,
		resetForm: false,
		validators: zod4Client(LoginSchema),
		onUpdated: async ({ form }) => {
			if (!form.valid) return;
			await AuthStore.login(form.data);
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
				<form id="login-form" use:enhance>
					<fieldset class="flex flex-col gap-2">
						<FormField {form} name="email">
							<InputField label="Email Address" bind:value={$formData.email} required />
						</FormField>

						<FormField {form} name="password">
							<InputField
								label="Password"
								bind:value={$formData.password}
								required
								type="password"
							/>
						</FormField>
					</fieldset>
				</form>
			</CardContent>

			<CardFooter>
				<Button type="submit" form="login-form" size="lg" class="w-full">Login</Button>
			</CardFooter>
		</Card>
	</CardContent>
</Card>
