<script lang="ts" module>
	import { z } from 'zod';

	export const PlanSchema = z.object({
		plan: z.string({ error: 'plan is required' }),
		max_branches: z.number({ error: 'Number of branches is required' }),
		max_users: z.number({ error: 'Number of users is required' }),
		duration_days: z.string({ error: 'Subscription duration is required' }),
		amount: z.number({ error: 'Price is required' }),
		is_active: z.string({ error: 'Plan status is required' })
	});

	export const statusItem = [
		{
			label: 'Enable',
			value: 'true'
		},
		{
			label: 'Disable',
			value: 'false'
		}
	];

	export const durationItem = [
		{
			label: '1 month',
			value: '30'
		},
		{
			label: '3 months',
			value: '90'
		},

		{
			label: '6 months',
			value: '180'
		},

		{
			label: '1 year',
			value: '365'
		}
	];
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
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { ArrowLeftIcon } from '@cariva/ui/icons';
	import { InputField } from '@cariva/ui/components/form-inputs/inputField/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { InputSelectField } from '@cariva/ui/components/form-inputs/inputSelectField/index.js';

	const { AppStore } = stores;

	const blankPlan = {
		plan: '',
		max_branches: undefined as unknown as number,
		max_users: undefined as unknown as number,
		duration_days: '',
		amount: undefined as unknown as number,
		is_active: 'true'
	};

	const form = superForm<z.infer<typeof PlanSchema>>(blankPlan, {
		SPA: true,
		resetForm: false,
		validators: zod4Client(PlanSchema),
		onUpdate: async ({ form }) => {
			console.log(form.data);
		}
	});

	const { form: formData, enhance, reset } = form;

	// Re-seed the form whenever the modal opens for a different plan (or for create)
	$effect(() => {
		const uid = AppStore.plansFormModal.plan_uid;

		if (!AppStore.isOpen.PLANS_FORM_MODAL) return;

		if (!uid) {
			reset({ data: blankPlan });
			return;
		}

		// fetch the plan for edit mode and seed the form once it arrives
		(async () => {
			// const plan = await fetchPlanByUid(uid); // however you're fetching a single plan
			// reset({ data: plan });
		})();
	});

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.PLANS_FORM_MODAL, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.PLANS_FORM_MODAL} closeModal={handleClose}>
	<DialogContent
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<DialogHeader>
			<Heading class="text-primary!"
				>{AppStore.plansFormModal.plan_uid ? 'Edit' : 'Create'} plan</Heading
			>
		</DialogHeader>

		<div class="flex flex-col gap-4 rounded-xl">
			<form id="login-form" use:enhance>
				<fieldset class="flex flex-col gap-3">
					<div class="grid grid-cols-[1fr_1fr] gap-2">
						<FormField {form} name="plan">
							<InputField
								label="Plan"
								type="text"
								placeholder="Enter plan name"
								bind:value={$formData.plan}
								required
							/>
						</FormField>
						<FormField {form} name="is_active">
							<InputSelectField
								label="Status"
								selectables={statusItem}
								type="single"
								placeholder="Select Status"
								bind:value={$formData.is_active}
								required
							/>
						</FormField>
					</div>

					<div class="grid grid-cols-[1fr_1fr] gap-2">
						<FormField {form} name="max_branches">
							<InputField
								label="Max No. of Branches"
								type="number"
								placeholder="e.g 10"
								bind:value={$formData.max_branches}
								required
							/>
						</FormField>

						<FormField {form} name="max_users">
							<InputField
								label="Max No. of users"
								type="number"
								placeholder="e.g 5"
								bind:value={$formData.max_users}
								required
							/>
						</FormField>
					</div>

					<div class="grid grid-cols-[1fr_1fr] gap-2">
						<FormField {form} name="duration_days">
							<InputSelectField
								label="Duration in days"
								type="single"
								selectables={durationItem}
								placeholder="e.g 180"
								bind:value={$formData.duration_days}
								required
							/>
						</FormField>

						<FormField {form} name="amount">
							<InputField
								label="amount"
								type="number"
								placeholder="e.g 250000"
								bind:value={$formData.amount}
								required
							/>
						</FormField>
					</div>
				</fieldset>
			</form>

			<Button size="lg">Verify now</Button>

			<DialogFooter class="border-t pt-3">
				<div class="flex w-full justify-start">
					<Button size="lg" variant="secondary" onclick={handleClose}>
						<ArrowLeftIcon class="size-3" />
						Back to login
					</Button>
				</div>
			</DialogFooter>
		</div>
	</DialogContent>
</DialogModal>
