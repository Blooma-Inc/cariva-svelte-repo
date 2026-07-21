<script lang="ts" module>
	import { z } from 'zod';

	export const PlanSchema = z.object({
		plan: z.string({ error: 'plan is required' }),
		max_branches: z.number({ error: 'Number of branches is required' }),
		max_users: z.number({ error: 'Number of users is required' }),
		duration_days: z.string({ error: 'Subscription duration is required' }),
		amount: z.number({ error: 'Price is required' }).min(0),
		is_active: z.string({ error: 'Plan status is required' })
	});

	export type PlanSchemaType = z.infer<typeof PlanSchema>;

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
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { AmountField } from '@cariva/ui/components/form-inputs/amount-field/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { postNewPlan } from '$lib/requests/sub_plan';
	import { toast } from '@cariva/ui/components/toast/index.js';
	import { parseError } from '$lib/utils/errorHandler';
	import { SUBSCRIPTION } from '$lib/constants/api';
	import { ccyConverter } from '$lib/utils/numbers';
	import { pickBy, isEqual } from 'lodash';

	const { AppStore } = stores;
	const queryClient = useQueryClient();

	const blankPlan = {
		plan: '',
		max_branches: undefined as unknown as number,
		max_users: undefined as unknown as number,
		duration_days: '',
		amount: undefined as unknown as number,
		is_active: 'true'
	};

	let editablePlan = $state<Partial<PlanSchemaType>>({});

	const cbFn = () => {
		queryClient.invalidateQueries({
			predicate: (query) => query.queryKey[0] === SUBSCRIPTION.GET
		});
		AppStore.toggleModals({});
	};

	const getChangedFields = (original: Partial<PlanSchemaType>, current: PlanSchemaType) => {
		return pickBy(current, (value: keyof PlanSchemaType, key: string) => {
			return !isEqual(original[key as keyof typeof original], value);
		});
	};

	const form = superForm<PlanSchemaType>(blankPlan, {
		SPA: true,
		resetForm: false,
		validators: zod4Client(PlanSchema),
		onUpdate: async ({ form }) => {
			if (AppStore.plansFormModal.plan_uid) {
				const changedValue = getChangedFields(editablePlan, form.data);
				const planDetails = JSON.parse(AppStore.plansFormModal.plan_uid) as SubscriptionItem;
				await AppStore.updateSubPlan(planDetails.uid, changedValue, cbFn);
				return;
			}
			await newPlanMutation.mutateAsync(form.data);
		}
	});

	const { form: formData, enhance, reset } = form;
	const hasChanged = $derived(isEqual(editablePlan, $formData));

	const newPlanMutation = createMutation(() => ({
		mutationFn: postNewPlan,
		onError: (error) => {
			toast.error(parseError(error));
		},
		onSuccess: () => {
			toast.success('Plan created successfully');
			cbFn();
		}
	}));

	const isLoading = $derived(newPlanMutation.isPending);

	$effect(() => {
		const uid = AppStore.plansFormModal.plan_uid;

		if (!uid) {
			reset({ data: blankPlan });
			return;
		} else {
			const planDetails = JSON.parse(uid) as SubscriptionItem;
			const data = {
				plan: planDetails.plan,
				is_active: planDetails.is_active.toString(),
				max_branches: planDetails.max_branches,
				max_users: planDetails.max_users,
				duration_days: planDetails.duration_days.toString(),
				amount: ccyConverter(Number(planDetails.amount), 'naira')
			};
			editablePlan = data;

			reset({
				data
			});
		}
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
			<form id="plan-form" use:enhance>
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
							<SelectField
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
							<SelectField
								label="Duration in days"
								type="single"
								selectables={durationItem}
								placeholder="e.g 180"
								bind:value={$formData.duration_days}
								required
							/>
						</FormField>

						<FormField {form} name="amount">
							<AmountField
								label="amount"
								type="number"
								placeholder="e.g 250,000"
								bind:value={$formData.amount}
								required
							/>
						</FormField>
					</div>
				</fieldset>
			</form>

			<DialogFooter class="border-t pt-3">
				<Button type="submit" form="plan-form" disabled={hasChanged || isLoading} size="lg">
					{AppStore.plansFormModal.plan_uid
						? isLoading
							? 'Editing'
							: 'Edit'
						: isLoading
							? 'Creating'
							: 'Create'}
				</Button>
			</DialogFooter>
		</div>
	</DialogContent>
</DialogModal>
