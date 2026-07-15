<script lang="ts" module>
	import { type Selectables } from '@cariva/ui/components/form-inputs/select-field/index.js';
	export const hospitalTypeItem: Selectables = [
		{ label: 'Hospital', value: 'hospital' },
		{ label: 'Clinic', value: 'clinic' },
		{ label: 'Rehabilitation center', value: 'rehabilitation center' },
		{ label: 'Specialist center', value: 'specialist center' },
		{ label: 'Mental health', value: 'mental health' }
	];
</script>

<script lang="ts">
	import CarivaHospitalForm from '$lib/assets/icons/form.png';
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbSeparator,
		BreadcrumbPage
	} from '@cariva/ui/components/ui/breadcrumb/index.js';
	import {
		Item,
		ItemContent,
		ItemDescription,
		ItemMedia,
		ItemTitle
	} from '@cariva/ui/components/ui/item/index.js';
	import { CheckIcon, CircleCheckIcon, SlashIcon } from '@cariva/ui/icons';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { ProvisionTenantSchema } from './validation.js';
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
	import { createFetchSubscriptions } from '$lib/hooks/subscriptions/createFetchSubscriptions.js';
	import { ccyFormatter } from '$lib/utils/numbers.js';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(ProvisionTenantSchema),
		onUpdated: async ({ form }) => {
			console.log(form.data);
		}
	});

	const { form: formData, enhance } = form;
	const subscriptionPlansQuery = createFetchSubscriptions();
</script>

<section class="flex w-full flex-col gap-4">
	<div>
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/tenants">Tenants</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<SlashIcon />
				</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbPage>New</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	</div>

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

	<form id="tenant-form" use:enhance class="flex w-full flex-col gap-4 pb-28">
		<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
			<Card class="self-start">
				<CardHeader>
					<CardTitle>Hospital Details</CardTitle>
					<CardDescription>Provide full details of your hospital.</CardDescription>
				</CardHeader>

				<CardContent>
					<fieldset class="flex flex-col gap-4">
						<div class="grid grid-cols-1 gap-2 lg:grid-cols-[2fr_1fr] lg:items-end">
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
									bind:value={$formData.tenant.code}
									required
								/>
							</FormField>
						</div>

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
									max={new Date()}
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
								const { plan, uid, max_branches, max_users, duration_days, amount } = subscription;
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
							>Create the first admin account for this hospital. They will receive login credentials
							via email.</CardDescription
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
										label="Middle Name"
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
		</div>

		<Button size="lg" type="submit" form="tenant-form" class="lg:w-fit">
			<CheckIcon class="size-3" />
			Provision Tenant
		</Button>
	</form>
</section>
