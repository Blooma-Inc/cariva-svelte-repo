<script lang="ts" module>
	import { z } from 'zod';

	export const WardFormSchema = z.object({
		name: z.string().trim().min(1, 'Ward name is required.'),
		ward_type: z.enum([
			'general',
			'maternity',
			'paediatric',
			'psychiatric',
			'icu',
			'emergency',
			'isolation',
			'private'
		]),
		gender_policy: z.enum(['mixed', 'male', 'female']),
		location_note: z.string().trim(),
		capacity: z.number().int().min(1, 'Capacity must be at least one bed.'),
		status: z.enum(['active', 'inactive'])
	});

	export type TWardFormSchema = z.infer<typeof WardFormSchema>;
</script>

<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import {
		SheetContent,
		SheetHeader,
		SheetFooter,
		SheetTitle,
		SheetDescription
	} from '@cariva/ui/components/ui/sheet/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { FACILITY } from '$lib/constants/api';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { getChangedFields } from '$lib/utils';

	const { AppStore, FacilityStore, PermissionStore } = stores;
	const context = $state.snapshot(AppStore.wardModal);
	const ward = context.ward;
	const isEditMode = Boolean(ward);
	const queryClient = useQueryClient();
	const canWrite = $derived(
		PermissionStore.can(isEditMode ? PERMISSIONS.WARDS_UPDATE : PERMISSIONS.WARDS_CREATE)
	);
	const initial: TWardFormSchema = {
		name: ward?.name ?? '',
		ward_type: ward?.ward_type ?? 'general',
		gender_policy: ward?.gender_policy ?? 'mixed',
		location_note: ward?.location_note ?? '',
		capacity: ward?.capacity ?? 1,
		status: ward?.is_active === false ? 'inactive' : 'active'
	};
	FacilityStore.errors.isWardLoading = '';
	const schema = WardFormSchema.extend({
		capacity: z
			.number()
			.int()
			.min(
				ward?.capacity ?? 1,
				isEditMode
					? 'Capacity reductions require retiring specific beds. This action is not available yet.'
					: 'Capacity must be at least one bed.'
			)
	});

	function payload(data: TWardFormSchema): CreateWardPayload {
		return {
			name: data.name.trim(),
			ward_type: data.ward_type,
			gender_policy: data.gender_policy,
			location_note: data.location_note.trim() || null,
			capacity: data.capacity,
			is_active: data.status === 'active'
		};
	}

	function handleClose() {
		if (FacilityStore.loaders.isWardLoading) return;
		AppStore.toggleModals({ name: AppModals.WARD_FORM_MODAL, open: false });
	}

	function onSuccess() {
		void queryClient.invalidateQueries({ queryKey: [FACILITY.OVERVIEW, context.branch_uid] });
		void queryClient.invalidateQueries({ queryKey: [FACILITY.BEDS, context.branch_uid] });
		AppStore.toggleModals({ name: AppModals.WARD_FORM_MODAL, open: false });
	}

	const form = superForm<TWardFormSchema>(
		{ ...initial },
		{
			SPA: true,
			dataType: 'json',
			resetForm: false,
			validators: zod4Client(schema),
			onUpdated: async ({ form: updated }) => {
				if (!updated.valid || !canWrite) return;
				if (ward) {
					const changes = getChangedFields(payload(initial), payload(updated.data));
					if (!Object.keys(changes).length) return;
					await FacilityStore.editWard(context.branch_uid, ward.uid, changes, onSuccess);
				} else {
					await FacilityStore.createWard(context.branch_uid, payload(updated.data), onSuccess);
				}
			}
		}
	);
	const { form: formData, enhance } = form;
	const hasChanges = $derived(
		Object.keys(getChangedFields(payload(initial), payload($formData))).length > 0
	);
	const wardTypes = WardFormSchema.shape.ward_type.options.map((value) => ({
		value,
		label: value === 'icu' ? 'ICU' : value.charAt(0).toUpperCase() + value.slice(1),
		enable: true
	}));
	const genderPolicies = WardFormSchema.shape.gender_policy.options.map((value) => ({
		value,
		label: value.charAt(0).toUpperCase() + value.slice(1),
		enable: true
	}));
</script>

<SheetModal isOpen={AppStore.isOpen.WARD_FORM_MODAL} closeModal={handleClose}>
	<SheetContent
		onEscapeKeydown={(event) => event.preventDefault()}
		onInteractOutside={(event) => event.preventDefault()}
		class="flex h-svh w-full! max-w-xl! flex-col overflow-clip"
	>
		<SheetHeader class="border-b">
			<SheetTitle>{isEditMode ? 'Edit Ward' : 'Add New Ward'}</SheetTitle>
			<SheetDescription>{context.branch_name}</SheetDescription>
		</SheetHeader>
		<form id="ward-form" use:enhance class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
			<fieldset
				disabled={FacilityStore.loaders.isWardLoading || !canWrite}
				class="flex flex-col gap-4"
			>
				<FormField {form} name="name"
					><InputField label="Ward name" bind:value={$formData.name} required /></FormField
				>
				<FormField {form} name="ward_type"
					><SelectField
						label="Ward type"
						placeholder="Select ward type"
						type="single"
						selectables={wardTypes}
						bind:value={$formData.ward_type}
						required
					/></FormField
				>
				<FormField {form} name="gender_policy"
					><SelectField
						label="Gender policy"
						placeholder="Select gender policy"
						type="single"
						selectables={genderPolicies}
						bind:value={$formData.gender_policy}
						required
					/></FormField
				>
				<FormField {form} name="location_note"
					><InputField label="Floor / location" bind:value={$formData.location_note} /></FormField
				>
				<FormField {form} name="capacity"
					><InputField
						label="Bed capacity"
						type="number"
						min={ward?.capacity ?? 1}
						step={1}
						bind:value={$formData.capacity}
						required
						description={isEditMode
							? 'Capacity cannot be reduced. Increasing it creates additional numbered beds; existing beds and their types are preserved.'
							: 'Beds are created and numbered automatically. ICU wards use ICU beds; other wards use standard beds.'}
					/></FormField
				>
				<FormField {form} name="status"
					><SelectField
						label="Status"
						placeholder="Select status"
						type="single"
						selectables={[
							{ value: 'active', label: 'Active', enable: true },
							{ value: 'inactive', label: 'Inactive', enable: true }
						]}
						bind:value={$formData.status}
						required
					/></FormField
				>
				{#if $formData.status === 'inactive'}
					<Paragraph size="sm"
						>Existing patient assignments remain unchanged. No new patients can be assigned to beds
						in this ward until it is reactivated.</Paragraph
					>
				{:else if ward?.is_active === false}
					<Paragraph size="sm"
						>Reactivating the ward preserves each bed's individual status.</Paragraph
					>
				{/if}
			</fieldset>
			{#if FacilityStore.errors.isWardLoading}<p role="alert" class="text-sm text-destructive">
					{FacilityStore.errors.isWardLoading}
				</p>{/if}
			{#if !canWrite}<p role="alert" class="text-sm text-destructive">
					You do not have permission to {isEditMode ? 'edit' : 'create'} wards.
				</p>{/if}
		</form>
		<SheetFooter class="border-t p-4">
			<Button
				variant="secondary"
				disabled={FacilityStore.loaders.isWardLoading}
				onclick={handleClose}>Cancel</Button
			>
			<Button
				type="submit"
				form="ward-form"
				aria-label={isEditMode ? 'Save Changes' : 'Create Ward'}
				aria-busy={FacilityStore.loaders.isWardLoading}
				isLoading={FacilityStore.loaders.isWardLoading}
				disabled={FacilityStore.loaders.isWardLoading || !canWrite || (isEditMode && !hasChanges)}
				>{isEditMode ? 'Save Changes' : 'Create Ward'}</Button
			>
		</SheetFooter>
	</SheetContent>
</SheetModal>
