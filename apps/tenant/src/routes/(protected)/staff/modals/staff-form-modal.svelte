<script lang="ts" module>
	import { email } from '$lib/validators';
	import { SvelteDate } from 'svelte/reactivity';
	import { z } from 'zod';

	export const createStaffSchema = z.object({
		first_name: z.string({ error: 'First name is needed.' }).trim(),
		last_name: z.string({ error: 'Last name is needed.' }).trim(),
		middle_name: z.string().trim().optional(),
		designation: z.string({ error: 'Designation is required' }).trim(),
		gender: z.string({ error: 'Gender is required' }).trim(),
		dob: z.date({ error: 'Date of Birth is needed.' }).transform((args) => new SvelteDate(args)),
		email,
		phone: z.string({ error: 'Phone is needed.' }).trim(),
		role_uid: z.string({ error: 'Assign a role.' }).trim(),
		branch_uid: z.string({ error: 'Assign a branch' })
	});

	export type TCreateStaffSchema = z.infer<typeof createStaffSchema>;
</script>

<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Card, CardContent, CardHeader, CardTitle } from '@cariva/ui/components/ui/card/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { DateField } from '@cariva/ui/components/form-inputs/date-field/index.js';
	import { TelField } from '@cariva/ui/components/form-inputs/tel-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { getChangedFields, sanitizeFormData } from '$lib/utils';
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import { SheetContent, SheetHeader, SheetFooter } from '@cariva/ui/components/ui/sheet/index.js';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { stores } from '$lib/store/index.svelte.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { useFetchRoles } from '$lib/hooks/roles/use-fetch-roles';
	import { TENANT } from '$lib/constants/api';
	import { AppModals } from '$lib/store/app/modal-types';
	import { designationItem, genderItem } from '$lib/constants/shared';
	import { useFetchTenantBranches } from '$lib/hooks/tenant/use-fetch-branches';

	const { AppStore, StaffStore } = stores;
	let editableStaff = $state<Partial<TCreateStaffSchema>>({});
	const queryClient = useQueryClient();
	const isEditMode = $state(Boolean(AppStore.userModal.user_uid));

	const rolesQuery = useFetchRoles();
	const rolesItem = $derived.by(() => {
		if (rolesQuery.status === 'success' && rolesQuery.data) {
			return rolesQuery.data?.data.map((role) => ({
				label: role.name,
				value: role.uid,
				enable: role.is_enabled
			}));
		}

		return [];
	});
	const branchQuery = useFetchTenantBranches({ q: '', limit: 10, offset: 0 });
	const branchItem = $derived.by(() => {
		if (branchQuery.status === 'success' && branchQuery.data) {
			return branchQuery.data?.data.map((branch) => ({
				label: branch.name,
				value: branch.uid,
				enable: true
			}));
		}

		return [];
	});

	const blankStaff: TCreateStaffSchema = {
		first_name: '',
		last_name: '',
		middle_name: '',
		designation: '',
		gender: '',
		dob: undefined as unknown as SvelteDate,
		email: '',
		phone: '',
		role_uid: '',
		branch_uid: ''
	};

	const cbFn = () => {
		queryClient.invalidateQueries({
			predicate: (query) => query.queryKey[0] === TENANT.STATS
		});
		AppStore.toggleModals({});
	};

	const form = superForm<TCreateStaffSchema>(blankStaff, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(createStaffSchema),
		onUpdated: async ({ form }) => {
			if (AppStore.branchModal.branch_uid) {
				const changedValue = getChangedFields(editableStaff, form.data);
				const staffDetails = JSON.parse(AppStore.userModal.user_uid) as StaffItem;
				const payload = sanitizeFormData(changedValue);
				await StaffStore.editStaff(staffDetails.uid, payload);
			} else {
				let payload = sanitizeFormData(form.data);
				await StaffStore.createStaff(payload, cbFn);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	const changedFields = $derived.by(() => {
		if (!AppStore.userModal.user_uid) return $formData;
		return getChangedFields<TCreateStaffSchema>(editableStaff, $formData);
	});
	const hasChanges = $derived(Object.keys(changedFields).length > 0);
	const isLoading = $derived(StaffStore.loaders.isStaffLoading);

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.STAFF_FORM_MODAL, open: false });
	};

	$effect(() => {
		const uid = AppStore.userModal.user_uid;

		if (!uid) {
			reset({ data: blankStaff });
			return;
		} else {
			const staffDetails = JSON.parse(uid) as StaffItem;
			const staff_role_uid = staffDetails.user_roles.length ? staffDetails.user_roles[0].uid : '';
			const staff_branch_uid = staffDetails.branch_assignments.length
				? staffDetails.branch_assignments[0].branch_uid
				: '';
			const data = {
				first_name: staffDetails.first_name,
				last_name: staffDetails.last_name,
				middle_name: staffDetails.middle_name ?? '',
				email: staffDetails.email,
				designation: staffDetails.designation ?? '',
				phone: staffDetails.phone,
				gender: staffDetails.gender ?? '',
				role_uid: staff_role_uid,
				branch_uid: staff_branch_uid
			};

			editableStaff = data;
			reset({
				data
			});
		}
	});

	$effect(() => {});
</script>

<SheetModal isOpen={AppStore.isOpen.STAFF_FORM_MODAL} closeModal={handleClose}>
	<SheetContent
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
		class="flex h-svh w-full! max-w-xl! flex-col overflow-clip "
	>
		<SheetHeader class="border">
			<Heading level="h3">{isEditMode ? 'Edit' : 'Provision'} Staff</Heading>
		</SheetHeader>

		<section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			<form id="tenant-form" use:enhance class="flex w-full flex-col gap-4">
				<fieldset disabled={isLoading} class="grid grid-cols-1 gap-3">
					<Card class="self-start">
						<CardHeader>
							<CardTitle>Personal Information</CardTitle>
						</CardHeader>

						<CardContent>
							<fieldset class="flex flex-col gap-3">
								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
									<FormField {form} name="first_name">
										<InputField
											label="First Name"
											placeholder="Ayomide"
											bind:value={$formData.first_name}
											required
										/>
									</FormField>
									<FormField {form} name="last_name">
										<InputField
											label="Last Name"
											placeholder="Musa"
											bind:value={$formData.last_name}
											required
										/>
									</FormField>
									<FormField {form} name="middle_name">
										<InputField
											label="Middle Name"
											placeholder="Obinna"
											bind:value={$formData.middle_name}
										/>
									</FormField>
								</div>

								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
									<FormField {form} name="designation">
										<SelectField
											label="Designation"
											type="single"
											placeholder="Select designation"
											selectables={designationItem}
											bind:value={$formData.designation}
											required
										/>
									</FormField>
									<FormField {form} name="gender">
										<SelectField
											label="Gender"
											type="single"
											placeholder="Select gender"
											selectables={genderItem}
											bind:value={$formData.gender}
											required
										/>
									</FormField>
									<FormField {form} name="dob">
										<DateField
											label="Date of Birth"
											placeholder="January 01 2001"
											bind:value={$formData.dob}
											max={new SvelteDate()}
											required
										/>
									</FormField>
								</div>
							</fieldset>
						</CardContent>
					</Card>

					<Card class="self-start">
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
						</CardHeader>

						<CardContent>
							<fieldset class="flex flex-col gap-3">
								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr] lg:items-end">
									<FormField {form} name="email">
										<InputField
											label="Email"
											placeholder="ayomusaobi@gmail.com"
											bind:value={$formData.email}
											required
										/>
									</FormField>
									<FormField {form} name="phone">
										<TelField
											label="Phone number"
											defaultCountry="NG"
											placeholder="08123456789"
											bind:value={$formData.phone}
											required
										/>
									</FormField>
								</div>
							</fieldset>
						</CardContent>
					</Card>

					<Card class="self-start">
						<CardHeader>
							<CardTitle>Roles and Permissions</CardTitle>
						</CardHeader>

						<CardContent>
							<fieldset class="flex flex-col gap-3">
								<FormField {form} name="role_uid">
									<SelectField
										label="Role"
										type="single"
										placeholder="Select role"
										selectables={rolesItem}
										bind:value={$formData.role_uid}
										required
									/>
								</FormField>
							</fieldset>
						</CardContent>
					</Card>

					<Card class="self-start">
						<CardHeader>
							<CardTitle>Branch Assignment</CardTitle>
						</CardHeader>

						<CardContent>
							<fieldset class="flex flex-col gap-3">
								<FormField {form} name="branch_uid">
									<SelectField
										label="Primary Branch"
										type="single"
										placeholder="Select branch"
										selectables={branchItem}
										bind:value={$formData.branch_uid}
										required
									/>
								</FormField>
							</fieldset>
						</CardContent>
					</Card>
				</fieldset>
			</form>
		</section>

		<SheetFooter class="border-t p-2">
			<Button
				size="lg"
				type="button"
				class="md:w-fit"
				variant="secondary"
				disabled={isLoading}
				onclick={handleClose}
			>
				Cancel
			</Button>
			<Button
				size="lg"
				type="submit"
				form="tenant-form"
				class="md:w-fit"
				disabled={isLoading || (isEditMode && !hasChanges)}
				{isLoading}
			>
				{isEditMode ? 'Update ' : 'Provision '}Staff
			</Button>
		</SheetFooter>
	</SheetContent>
</SheetModal>
