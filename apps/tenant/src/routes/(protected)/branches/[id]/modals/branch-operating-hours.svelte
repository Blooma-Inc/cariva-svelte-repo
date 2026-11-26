<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { CheckField } from '@cariva/ui/components/form-inputs/check-field/index.js';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import {
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { branch } from '$lib/hooks/branch/fetch-key-factory';
	import { tenant } from '$lib/hooks/tenant/fetch-key-factory';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		branchHoursDefaults,
		branchHoursPayload,
		branchHoursSchema,
		DEFAULT_WEEK_DAYS
	} from '$lib/validators/branch-hours';

	const { AppStore, BranchStore, PermissionStore } = stores;
	const queryClient = useQueryClient();
	const branchUid = AppStore.branchModal.branch_uid;
	const saved = branchHoursDefaults(
		AppStore.branchModal.timezone,
		AppStore.branchModal.working_hours ? JSON.parse(AppStore.branchModal.working_hours) : null
	);
	BranchStore.errors.isBranchLoading = '';
	const timezones = Array.from(
		new Set([saved.timezone, 'UTC', ...Intl.supportedValuesOf('timeZone')])
	)
		.filter(Boolean)
		.sort()
		.map((value) => ({ label: value.replaceAll('_', ' '), value, enable: true }));

	const form = superForm(saved, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(branchHoursSchema),
		onUpdated: async ({ form }) => {
			if (
				!form.valid ||
				BranchStore.loaders.isBranchLoading ||
				!PermissionStore.can(PERMISSIONS.BRANCHES_UPDATE)
			)
				return;
			await BranchStore.editBranch(branchUid, branchHoursPayload(form.data), () => {
				void queryClient.invalidateQueries({ queryKey: branch.getBranchByUid(branchUid).keys() });
				void queryClient.invalidateQueries({
					queryKey: tenant.getTenantBranches({ limit: 100, offset: 0 }).keys()
				});
				AppStore.toggleModals({ name: AppModals.BRANCH_OPERATING_HOURS_FROM, open: false });
			});
		}
	});

	const { form: formData, enhance, reset } = form;
	const hasChanges = $derived(JSON.stringify($formData) !== JSON.stringify(saved));
	const isLoading = $derived(BranchStore.loaders.isBranchLoading);
	const canEdit = $derived(PermissionStore.can(PERMISSIONS.BRANCHES_UPDATE));
	const handleClose = () => {
		if (!isLoading)
			AppStore.toggleModals({ name: AppModals.BRANCH_OPERATING_HOURS_FROM, open: false });
	};
	const resetSaved = () => {
		reset({ data: structuredClone(saved) });
		BranchStore.errors.isBranchLoading = '';
	};
</script>

<DialogModal isOpen={AppStore.isOpen.BRANCH_OPERATING_HOURS_FROM} closeModal={handleClose}>
	<DialogContent
		onEscapeKeydown={(e) => {
			if (isLoading) e.preventDefault();
		}}
		onInteractOutside={(e) => e.preventDefault()}
		class="flex max-h-[85vh] w-full max-w-full! flex-col overflow-clip md:max-w-3xl!"
	>
		<DialogHeader>
			<Heading level="h2">Edit Operating Hours</Heading>
			<Paragraph size="sm" muted>Set the branch's local working hours.</Paragraph>
		</DialogHeader>
		<section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			<form id="branch-operating-hours-form" use:enhance class="flex w-full flex-col gap-4">
				<fieldset disabled={isLoading || !canEdit} class="flex min-w-0 flex-col gap-4">
					<FormField {form} name="timezone">
						<SelectField
							type="single"
							label="Branch timezone"
							placeholder="Select a timezone"
							selectables={timezones}
							bind:value={$formData.timezone}
						/>
					</FormField>
					<Paragraph size="sm" muted
						>Hours use this timezone. Changing it shifts recurring schedules; existing appointment
						times stay unchanged.</Paragraph
					>
					<div class="flex flex-col gap-4 rounded-lg border p-4">
						<Heading level="h3">Working Hours</Heading>
						{#each $formData.days as day, index (day.week_day)}
							<div class="flex flex-col gap-3 border-t pt-3">
								<div class="grid grid-cols-1 items-center gap-3 sm:grid-cols-[7rem_1fr]">
									<Paragraph size="sm">{DEFAULT_WEEK_DAYS[day.week_day].label}</Paragraph>
									<div class="grid grid-cols-2 gap-3">
										<FormField {form} name={`days[${index}].is_enabled`}>
											<CheckField
												label={day.is_enabled ? 'Enabled' : 'Closed'}
												bind:checked={$formData.days[index].is_enabled}
											/>
										</FormField>
										<FormField {form} name={`days[${index}].all_day`}>
											<CheckField
												label="All day"
												disabled={!day.is_enabled}
												bind:checked={$formData.days[index].all_day}
											/>
										</FormField>
									</div>
								</div>
								{#if day.is_enabled && !day.all_day}
									<div class="grid grid-cols-1 gap-3 sm:ml-32 sm:grid-cols-2">
										<FormField {form} name={`days[${index}].open_time`}>
											<InputField
												type="time"
												label="Opening time"
												bind:value={$formData.days[index].open_time}
											/>
										</FormField>
										<FormField {form} name={`days[${index}].close_time`}>
											<InputField
												type="time"
												label="Closing time"
												bind:value={$formData.days[index].close_time}
											/>
										</FormField>
									</div>
									{#if day.open_time && day.close_time && day.close_time < day.open_time}
										<Paragraph size="sm" muted>Closes the next day.</Paragraph>
									{/if}
								{/if}
							</div>
						{/each}
						<div class="flex flex-col gap-3 border-t pt-3">
							<Heading level="h3">Emergency Services</Heading>
							<FormField {form} name="is_emergency_services">
								<CheckField label="Available 24/7" bind:checked={$formData.is_emergency_services} />
							</FormField>
							<Paragraph size="sm" muted
								>Emergency availability does not extend appointment hours.</Paragraph
							>
						</div>
					</div>
				</fieldset>
				{#if BranchStore.errors.isBranchLoading}
					<p role="alert" class="text-sm text-destructive">{BranchStore.errors.isBranchLoading}</p>
				{/if}
			</form>
		</section>
		<DialogFooter class="border-t p-2">
			<Button
				size="lg"
				type="button"
				variant="secondary"
				disabled={isLoading || !hasChanges}
				onclick={resetSaved}>Reset changes</Button
			>
			<Button
				size="lg"
				type="submit"
				form="branch-operating-hours-form"
				disabled={isLoading || !hasChanges || !canEdit}
				{isLoading}>Save preferences</Button
			>
		</DialogFooter>
	</DialogContent>
</DialogModal>
