<script lang="ts" module>
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { z } from 'zod';

	export const DEFAULT_WEEK_DAYS = [
		{ label: 'Monday', value: 0 },
		{ label: 'Tuesday', value: 1 },
		{ label: 'Wednessday', value: 2 },
		{ label: 'Thursday', value: 3 },
		{ label: 'Friday', value: 4 },
		{ label: 'Saturday', value: 5 },
		{ label: 'Sunday', value: 6 }
	];

	export const branchOperatingDay = z
		.object({
			week_day: z.number(),
			open_time: z.string().trim().nullable().default(null),
			close_time: z.string().trim().nullable().default(null),
			is_enabled: z.boolean().default(false)
		})
		.superRefine((data, ctx) => {
			const { open_time, close_time, is_enabled } = data;

			if (is_enabled) {
				if (!open_time) {
					ctx.addIssue({
						code: 'custom',
						path: ['open_time'],
						message: 'Opening time is required.'
					});
				}

				if (!close_time) {
					ctx.addIssue({
						code: 'custom',
						path: ['close_time'],
						message: 'Closing time is required.'
					});
				}
			}
		});

	export const branchWorkingHoursSchema = z.object({
		days: z.array(branchOperatingDay),
		is_emergency_services: z.boolean().default(false)
	});

	export type TBranchWorkingHours = z.infer<typeof branchWorkingHoursSchema>;
</script>

<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { CheckField } from '@cariva/ui/components/form-inputs/check-field/index.js';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { DialogContent, DialogHeader } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	// import { useQueryClient } from '@tanstack/svelte-query';
	// import { TENANT } from '$lib/constants/api';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { getChangedFields, sanitizeFormData } from '$lib/utils';

	const { AppStore, BranchStore } = stores;
	let editableWorkingHours = $state<Partial<TBranchWorkingHours>>({});
	// const queryClient = useQueryClient();

	const blankWorkingHours: TBranchWorkingHours = {
		days: DEFAULT_WEEK_DAYS.map(({ value }) => ({
			week_day: value,
			open_time: null,
			close_time: null,
			is_enabled: false
		})),
		is_emergency_services: false
	};

	// const cbFn = () => {
	// 	queryClient.invalidateQueries({
	// 		predicate: (query) => query.queryKey[0] === TENANT.BRANCHES
	// 	});
	// 	AppStore.toggleModals({});
	// };

	const form = superForm<TBranchWorkingHours>(blankWorkingHours, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(branchWorkingHoursSchema),
		onUpdated: async ({ form }) => {
			if (AppStore.branchModal.branch_uid) {
				// const changedValue = getChangedFields(editableWorkingHours, form.data);
				// const branchDetails = JSON.parse(AppStore.branchModal.branch_uid) as TenantBranchItem;
				// const payload = sanitizeFormData(changedValue);
				// await BranchStore.editBranch(branchDetails.uid, payload);
			} else {
				const payload = sanitizeFormData(form.data);
				// await BranchStore.createBranch(payload, cbFn);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	const changedFields = $derived.by(() => {
		if (!AppStore.branchModal.branch_uid) return $formData;
		return getChangedFields<TBranchWorkingHours>(editableWorkingHours, $formData);
	});
	// const hasChanges = $derived(Object.keys(changedFields).length > 0);
	// const isLoading = $derived(BranchStore.loaders.isBranchLoading);

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.BRANCH_FORM_MODAL, open: false });
	};

	$effect(() => {
		const workingHours = AppStore.branchModal.working_hours;

		if (!workingHours) {
			reset({ data: blankWorkingHours });
			return;
		} else {
			const branchWorkingHoursDetails = JSON.parse(workingHours) as BranchOperatingHours;

			const data = {
				...branchWorkingHoursDetails
			};

			editableWorkingHours = data;
			reset({
				data
			});
		}
	});
</script>

<DialogModal isOpen={AppStore.isOpen.BRANCH_OPERATING_HOURS_FROM} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
		class="max-w-2xl!"
	>
		<DialogHeader>
			<Heading level="h2">Working Hours</Heading>
		</DialogHeader>

		<section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			<form id="tenant-form" use:enhance class="flex w-full flex-col gap-4">
				<fieldset disabled={BranchStore.loaders.isBranchLoading} class="grid grid-cols-1 gap-3">
					{#each $formData.days as day, index (index)}
						<div class="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3">
							<div class="text-sm font-medium">
								{DEFAULT_WEEK_DAYS.find((item) => item.value === day.week_day)?.label}
							</div>

							<FormField {form} name={`days[${index}].open_time`}>
								<InputField
									type="time"
									label=""
									disabled={!day.is_enabled}
									class="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
								/>
							</FormField>

							<FormField {form} name={`days[${index}].close_time`}>
								<InputField
									type="time"
									label=""
									disabled={!day.is_enabled}
									class="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
								/>
							</FormField>

							<FormField {form} name={`days[${index}].is_enabled`}>
								<CheckField label="" />
							</FormField>
						</div>
					{/each}

					<FormField {form} name="is_emergency_services">
						<CheckField label="Emergency Services" />
					</FormField>
				</fieldset>
			</form>
		</section>
	</DialogContent>
</DialogModal>
