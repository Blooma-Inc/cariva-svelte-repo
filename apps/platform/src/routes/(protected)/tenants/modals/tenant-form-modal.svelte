<script lang="ts" module>
	import { email } from '$lib/validators';
	import { SvelteDate } from 'svelte/reactivity';
	import { z } from 'zod';
	import { type Selectables } from '@cariva/ui/components/form-inputs/select-field/index.js';

	export const hospitalTypeItem: Selectables = [
		{ label: 'Hospital', value: 'hospital', enable: true },
		{ label: 'Clinic', value: 'clinic', enable: true },
		{ label: 'Rehabilitation center', value: 'rehabilitation center', enable: true },
		{ label: 'Specialist center', value: 'specialist center', enable: true },
		{ label: 'Mental health', value: 'mental health', enable: true }
	];

	export const CreateTenantSchema = z.object({
		name: z.string({ error: 'Tenant name is needed.' }).trim(),
		code: z.string({ error: 'Tenant code is needed.' }).trim(),
		hospital_type: z.string({ error: 'Tenant hospital type is needed.' }).trim(),
		registration_number: z.string({ error: 'Registration no is needed.' }).trim(),
		date_established: z
			.date({ error: 'Date Established is needed.' })
			.transform((args) => new SvelteDate(args)),
		website_url: z.string({ error: 'Tenant website url is needed.' }).trim(),
		email
	});

	export const CreateBranchSchema = z.object({
		name: z.string({ error: 'Main branch name is needed.' }).trim().default('Main branch'),
		address: z.string({ error: 'Office address is needed.' }).trim(),
		city: z.string({ error: 'city is needed.' }).trim(),
		state: z.string({ error: 'State is needed.' }).trim(),
		country: z.string({ error: 'Country is needed.' }).trim()
	});

	export const CreateTenantAdminSchema = z.object({
		first_name: z.string({ error: 'First name is needed.' }).trim(),
		last_name: z.string({ error: 'Last name is needed.' }).trim(),
		middle_name: z.string().trim().optional(),
		phone: z.string({ error: 'Phone is needed.' }).trim(),
		email
	});

	export const ProvisionTenantSchema = z.object({
		tenant: CreateTenantSchema,
		subscription_uid: z.string({ error: 'Select a subscription' }),
		main_branch: CreateBranchSchema,
		admin: CreateTenantAdminSchema
	});

	export type TCreateTenantAdminSchema = z.infer<typeof CreateTenantAdminSchema>;
	export type TProvisionTenantSchema = z.infer<typeof ProvisionTenantSchema>;
</script>

<script lang="ts">
	import CarivaHospitalForm from '$lib/assets/icons/form.png';
	import {
		Item,
		ItemContent,
		ItemDescription,
		ItemMedia,
		ItemTitle
	} from '@cariva/ui/components/ui/item/index.js';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '@cariva/ui/components/ui/card/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { TextareaField } from '@cariva/ui/components/form-inputs/textarea-field/index.js';
	import {
		RadioField,
		type RadioItemDataProps
	} from '@cariva/ui/components/form-inputs/radio-field/index.js';
	import { DateField } from '@cariva/ui/components/form-inputs/date-field/index.js';
	import { TelField } from '@cariva/ui/components/form-inputs/tel-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { useFetchSubscriptions } from '$lib/hooks/subscriptions/use-fetch-subscriptions.js';
	import { ccyFormatter } from '$lib/utils/numbers.js';
	import { useFetchTenantSuggestedCode } from '$lib/hooks/tenant/use-fetch-tenant-suggested-code.svelte.js';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte.js';
	import { stores } from '$lib/store/index.svelte.js';
	import SheetModal from '$lib/atoms/modals/sheetModal.svelte';
	import { SheetContent, SheetHeader, SheetFooter } from '@cariva/ui/components/ui/sheet/index.js';
	import { AppModals } from '$lib/store/app/modal-types.js';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { useFetchTenantAdmin } from '$lib/hooks/tenant/use-fetch-tenant-admin.svelte';
	import { TENANT } from '$lib/constants/api.js';
	import { getChangedFields } from '$lib/utils';
	import { svelteDateToYearMonthDay } from '$lib/utils/date';

	const { TenantStore, AppStore } = stores;
	let editableTenant = $state<Partial<TProvisionTenantSchema>>({});
	let tenantAdmin = $state<TCreateTenantAdminSchema>({
		first_name: '',
		last_name: '',
		middle_name: '',
		phone: '',
		email: ''
	});
	const queryClient = useQueryClient();
	const isEditMode = $state(Boolean(AppStore.tenantModal.tenant_uid));
	const tenantAdminQuery = useFetchTenantAdmin(() =>
		AppStore.tenantModal.tenant_uid
			? (JSON.parse(AppStore.tenantModal.tenant_uid) as PlatformTenantItem).uid
			: ''
	);

	function getTenantAdmin() {
		return tenantAdmin;
	}

	const blankTenant = {
		tenant: {
			name: '',
			code: '',
			hospital_type: '',
			registration_number: '',
			date_established: undefined as unknown as SvelteDate,
			website_url: '',
			email: ''
		},
		subscription_uid: '',
		main_branch: {
			name: 'Main branch',
			address: '',
			city: '',
			state: '',
			country: ''
		},
		admin: getTenantAdmin()
	};

	const cbFn = () => {
		queryClient.invalidateQueries({
			predicate: (query) => query.queryKey[0] === TENANT.TENANTS
		});
		AppStore.toggleModals({});
	};

	function sanitizeFormData(formData: Partial<TProvisionTenantSchema>) {
		const payload = structuredClone(formData);
		if (payload.tenant?.date_established) {
			payload.tenant.date_established = svelteDateToYearMonthDay(
				payload.tenant.date_established
			) as unknown as SvelteDate;
		}

		return payload as TProvisionTenantSchema;
	}

	const form = superForm<TProvisionTenantSchema>(blankTenant, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(ProvisionTenantSchema),
		onUpdated: async ({ form }) => {
			if (AppStore.tenantModal.tenant_uid) {
				const changedValue = getChangedFields(editableTenant, form.data);
				const tenantDetails = JSON.parse(AppStore.tenantModal.tenant_uid) as PlatformTenantItem;
				const payload = sanitizeFormData(changedValue);
				await TenantStore.editTenantRequest(tenantDetails.uid, payload);
			} else {
				const payload = sanitizeFormData(form.data);
				await TenantStore.submitTenantRequest(payload, cbFn);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	const changedFields = $derived.by(() => {
		if (!AppStore.tenantModal.tenant_uid) return $formData;
		return getChangedFields<TProvisionTenantSchema>(editableTenant, $formData);
	});

	const hasChanges = $derived(Object.keys(changedFields).length > 0);
	const subscriptionPlansQuery = useFetchSubscriptions();

	const hospital_name = $derived($formData.tenant.name);
	const city = $derived($formData.main_branch.city);

	const debouncedHospitalName = useDebounce(() => hospital_name, 500);
	const debouncedCity = useDebounce(() => city, 500);

	const canSuggestTenantCode = $derived.by(() => {
		if (isEditMode) {
			const hasChanged =
				$formData.tenant.name != editableTenant.tenant?.name ||
				$formData.main_branch.city != editableTenant.main_branch?.city;
			return hasChanged;
		} else {
			return true;
		}
	});

	const tenantSuggestedCodeQuery = useFetchTenantSuggestedCode(
		() => debouncedHospitalName.value,
		() => debouncedCity.value,
		() => canSuggestTenantCode
	);

	const displayedTenantCode = $derived.by(() => {
		if (isEditMode && !canSuggestTenantCode) {
			return editableTenant.tenant?.code ?? '';
		}
		return tenantSuggestedCodeQuery.data ?? '';
	});

	const isLoading = $derived(TenantStore.loaders.isTenantRequest || tenantAdminQuery.isLoading);

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.TENANT_FORM_MODAL, open: false });
	};

	$effect(() => {
		if (tenantSuggestedCodeQuery.status === 'success' && tenantSuggestedCodeQuery.data) {
			$formData.tenant.code = displayedTenantCode;
		}
	});

	$effect(() => {
		if (!tenantAdminQuery.isLoading && tenantAdminQuery.data !== undefined) {
			tenantAdmin = {
				first_name: tenantAdminQuery.data.first_name,
				middle_name: tenantAdminQuery.data.middle_name ?? '',
				last_name: tenantAdminQuery.data.last_name,
				phone: tenantAdminQuery.data.phone,
				email: tenantAdminQuery.data.email
			};
		}
	});

	$effect(() => {
		const uid = AppStore.tenantModal.tenant_uid;

		if (!uid) {
			reset({ data: blankTenant });
			return;
		} else {
			const tenantDetails = JSON.parse(uid) as PlatformTenantItem;

			const data = {
				tenant: {
					name: tenantDetails.name,
					code: tenantDetails.code,
					hospital_type: tenantDetails.hospital_type,
					registration_number: tenantDetails.registration_number,
					date_established: new SvelteDate(tenantDetails.date_established),
					website_url: tenantDetails.website_url ?? '',
					email: tenantDetails.email ?? ''
				},
				subscription_uid: tenantDetails.latest_subscription.subscription_plan_uid ?? '',
				main_branch: {
					name: tenantDetails.main_branch.name,
					address: tenantDetails.main_branch.address,
					city: tenantDetails.main_branch.city,
					state: tenantDetails.main_branch.state,
					country: tenantDetails.main_branch.country
				},
				admin: getTenantAdmin()
			};

			editableTenant = data;
			reset({
				data
			});
		}
	});
</script>

<SheetModal isOpen={AppStore.isOpen.TENANT_FORM_MODAL} closeModal={handleClose}>
	<SheetContent
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
		class="flex h-svh w-full max-w-xl! flex-col overflow-clip "
	>
		<SheetHeader class="border">
			<Heading level="h3">{isEditMode ? 'Edit' : 'Provision'} Tenant</Heading>
		</SheetHeader>

		<section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			{#if !isEditMode}
				<Item class="bg-info/20 p-2">
					<ItemMedia class="hidden h-36 w-28 p-1 lg:block">
						<img src={CarivaHospitalForm} alt="form" class="h-full w-full object-cover" />
					</ItemMedia>
					<ItemContent class="gap-2">
						<ItemTitle
							>You're about to onboard a new hospital onto the Cariva platform. This will create:</ItemTitle
						>

						<ItemContent class="gap-1">
							<div class="flex items-center justify-start gap-2">
								<CircleCheckIcon class="size-3 text-info" />
								<ItemDescription>A tenant account for the hospital</ItemDescription>
							</div>
							<div class="flex items-center justify-start gap-2">
								<CircleCheckIcon class="size-3 text-info" />
								<ItemDescription>Their first branch location</ItemDescription>
							</div>
							<div class="flex items-center justify-start gap-2">
								<CircleCheckIcon class="size-3 text-info" />
								<ItemDescription>A Tenant Admin user account</ItemDescription>
							</div>
						</ItemContent>

						<ItemTitle class="text-warning"
							>All information can be edited later except the Tenant Code.</ItemTitle
						>
					</ItemContent>
				</Item>
			{/if}

			<form id="tenant-form" use:enhance class="flex w-full flex-col gap-4">
				<fieldset disabled={TenantStore.loaders.isTenantRequest} class="grid grid-cols-1 gap-3">
					<Card class="self-start">
						<CardHeader>
							<CardTitle>Hospital Details</CardTitle>
							<CardDescription>Provide full details of your hospital.</CardDescription>
						</CardHeader>

						<CardContent>
							<fieldset class="flex flex-col gap-3">
								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[2fr_1fr]">
									<FormField {form} name="tenant.name">
										<InputField
											label="Hospital Name"
											placeholder="Lagos University Teaching Hospital"
											bind:value={$formData.tenant.name}
											required
										/>
									</FormField>
									<FormField {form} name="tenant.code">
										<InputField
											label="Code"
											placeholder="e.g LUTH"
											disabled
											bind:value={$formData.tenant.code}
											required
											description="Auto generated field."
											isLoading={tenantSuggestedCodeQuery.isLoading}
										/>
									</FormField>
								</div>

								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
									<FormField {form} name="main_branch.city">
										<InputField
											label="City"
											placeholder="Select city"
											bind:value={$formData.main_branch.city}
											required
										/>
									</FormField>
									<FormField {form} name="main_branch.state">
										<InputField
											label="State"
											placeholder="Select state"
											bind:value={$formData.main_branch.state}
											required
										/>
									</FormField>
									<FormField {form} name="main_branch.country">
										<InputField
											label="Country"
											placeholder="Select country"
											bind:value={$formData.main_branch.country}
											required
										/>
									</FormField>
								</div>

								<FormField {form} name="main_branch.address">
									<TextareaField
										label="Physical Address (Main branch location)"
										placeholder="123 Medical Avenue, Idi-Araba"
										bind:value={$formData.main_branch.address}
										required
									/>
								</FormField>

								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
									<FormField {form} name="tenant.hospital_type">
										<SelectField
											label="Hospital Type"
											type="single"
											placeholder="Select hospital type"
											selectables={hospitalTypeItem}
											bind:value={$formData.tenant.hospital_type}
											required
										/>
									</FormField>
									<FormField {form} name="tenant.registration_number">
										<InputField
											label="Reg. Number"
											placeholder="RC/XXXXXXX/2020"
											bind:value={$formData.tenant.registration_number}
											required
										/>
									</FormField>
									<FormField {form} name="tenant.date_established">
										<DateField
											label="Date Established"
											placeholder="January 01 2001"
											bind:value={$formData.tenant.date_established}
											max={new SvelteDate()}
											required
										/>
									</FormField>
								</div>

								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr] lg:items-end">
									<FormField {form} name="tenant.email">
										<InputField
											label="Main Email"
											placeholder="info@luth.gov.ng"
											bind:value={$formData.tenant.email}
											required
										/>
									</FormField>
									<FormField {form} name="tenant.website_url">
										<InputField
											label="Website"
											placeholder="www.luthhealth.org"
											bind:value={$formData.tenant.website_url}
											required
										/>
									</FormField>
								</div>
							</fieldset>
						</CardContent>
					</Card>

					<fieldset class="flex w-full flex-col gap-3">
						<Card>
							<CardHeader>
								<CardTitle>Subscription Details</CardTitle>
								<CardDescription>You can change this later in tenant settings</CardDescription>
							</CardHeader>
							<CardContent>
								{#if subscriptionPlansQuery.status === 'pending'}
									<p>Fetching subscription data...</p>
								{:else if subscriptionPlansQuery.status === 'error'}
									<p>Error Page</p>
									<p>Might need to reload</p>
								{:else if subscriptionPlansQuery.data}
									{@const plans = subscriptionPlansQuery.data.data.map((subscription) => {
										const { plan, uid, max_branches, max_users, duration_days, amount } =
											subscription;
										const item: RadioItemDataProps = {
											label: `${plan} - ${Number(amount) == 0 ? 'Free' : ccyFormatter(Number(amount))}`,
											value: uid,
											description: `${duration_days} days, ${max_branches} ${max_branches == 1 ? 'branch' : 'branches'}, ${max_users} ${max_users == 1 ? 'user' : 'users'}`
										};

										return item;
									})}

									<FormField {form} name="subscription_uid">
										<RadioField
											items={plans.reverse()}
											class="grid grid-cols-1 gap-2"
											bind:value={$formData.subscription_uid}
											required
										/>
									</FormField>
								{/if}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Tenant Administrator</CardTitle>
								<CardDescription
									>Create the first admin account for this hospital. They will receive login
									credentials via email.</CardDescription
								>
							</CardHeader>
							<CardContent>
								<fieldset class="flex flex-col gap-4">
									<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
										<FormField {form} name="admin.first_name">
											<InputField
												label="First Name"
												placeholder="Jude"
												bind:value={$formData.admin.first_name}
												required
											/>
										</FormField>
										<FormField {form} name="admin.middle_name">
											<InputField
												label="Middle Name (optional)"
												placeholder="Musa"
												bind:value={$formData.admin.middle_name}
											/>
										</FormField>
										<FormField {form} name="admin.last_name">
											<InputField
												label="Last Name"
												placeholder="Adebayo"
												bind:value={$formData.admin.last_name}
												required
											/>
										</FormField>
									</div>

									<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr] lg:items-end">
										<FormField {form} name="admin.email">
											<InputField
												label="Email Address"
												placeholder="admin@luth.gov.ng"
												bind:value={$formData.admin.email}
												required
											/>
										</FormField>
										<FormField {form} name="admin.phone">
											<TelField
												label="Phone number"
												defaultCountry="NG"
												placeholder="08123456789"
												bind:value={$formData.admin.phone}
												required
											/>
										</FormField>
									</div>
								</fieldset>
							</CardContent>
						</Card>
					</fieldset>
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
				{isEditMode ? 'Update ' : 'Provision '}Tenant
			</Button>
		</SheetFooter>
	</SheetContent>
</SheetModal>
