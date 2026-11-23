<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { getChangedFields } from '$lib/utils';
	import { stores } from '$lib/store/index.svelte';
	import { genderItem } from '$lib/constants/shared';
	import { formatDate, svelteDateToYearMonthDay } from '$lib/utils/date';
	import { DateField } from '@cariva/ui/components/form-inputs/date-field/index.js';
	import { PatientRegSchema, type PatientReg } from '../validation';
	import UserAvatar from '$lib/components/user-avatar.svelte';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { ChevronLeft } from '@lucide/svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { PATIENTS } from '$lib/constants/api';

	const { PatientStore } = stores;
	let queryClient = useQueryClient();

	let duplicates = $state<Array<PatientSearchResultItem> | undefined>(undefined);
	let currentPatientUid = $state('');
	let registered = $state(false);
	const blankForm = {
		bio: {
			first_name: '',
			last_name: '',
			other_name: '',
			gender: '',
			patient_no: '',
			date_of_birth: undefined as unknown as SvelteDate,
			imported_patient_no: '',
			nin: null
		},
		contact: null,
		address: null,
		details: null,
		next_of_kin: null,
		first_emergency_contact: null,
		second_emergency_contact: null,
		insurance: null
	};

	function sanitizeFormData(formData: PatientReg) {
		const payload = structuredClone(formData);
		if (payload.bio.date_of_birth) {
			payload.bio.date_of_birth = svelteDateToYearMonthDay(
				payload.bio.date_of_birth
			) as unknown as SvelteDate;
		}

		return payload as PatientReg;
	}

	const handleInvalidation = () => {
		queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === PATIENTS.ALL });
	};

	const handleReset = () => {
		registered = false;
		duplicates = undefined;
		reset();
	};

	const handleLinkPatientTenant = async (patient_uid: string) => {
		currentPatientUid = patient_uid;
		await PatientStore.linkPatientToTenant(patient_uid, () => {
			handleReset();
			handleInvalidation();
		});
	};

	const form = superForm<PatientReg>(blankForm, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(PatientRegSchema),
		onUpdate: async ({ form }) => {
			if (form.valid) {
				const payload = sanitizeFormData(form.data);
				const res = await PatientStore.checkExistingPatients(payload.bio);

				if (res) {
					if (!res.exists) {
						await PatientStore.registerPatient({
							patientReg: payload,
							dismissed_candidate_uids: res.candidates.map((r) => r.uid),
							was_ambiguous_check: res.confidence ? res.confidence === 'ambiguous' : false,
							cb: () => {
								registered = true;
								handleInvalidation();
							}
						});
					} else {
						duplicates = res.candidates;
					}
				}
			}
		},
		onUpdated: () => {
			if (registered) {
				handleReset();
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	const changedFields = $derived.by(() => {
		return getChangedFields<PatientReg>(blankForm, $formData);
	});
	const hasChanges = $derived(Object.keys(changedFields).length > 0);
	const loading = $derived(
		PatientStore.loaders.isCheckingExisting || PatientStore.loaders.isRegisteringPatient
	);
</script>

<Card>
	<CardHeader>
		{#if duplicates && duplicates.length}
			<Button
				type="button"
				size="xs"
				class="w-fit"
				variant="secondary"
				onclick={() => (duplicates = undefined)}
			>
				<ChevronLeft />
				Back
			</Button>
		{:else}
			<CardTitle>New Patient</CardTitle>
		{/if}
	</CardHeader>

	<CardContent>
		<div class="flex flex-col gap-4">
			{#if duplicates && duplicates.length}
				<div class="flex flex-col gap-2">
					<Paragraph>Possible duplicate data found</Paragraph>
					{#each duplicates as patient (patient.uid)}
						<div class="flex items-center justify-between">
							<UserAvatar
								photoUrl=""
								firstName={patient.first_name}
								lastName={patient.last_name}
								email={`DOB: ${formatDate(patient.date_of_birth)}`}
							/>

							{#if patient.patient_tenant_links}
								<Button type="button" disabled={PatientStore.loaders.isLinking}>See Profile</Button>
							{:else}
								<Button
									type="button"
									disabled={PatientStore.loaders.isLinking}
									isLoading={PatientStore.loaders.isLinking && currentPatientUid === patient.uid}
									onclick={() => handleLinkPatientTenant(patient.uid)}>Register</Button
								>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<form use:enhance>
					<fieldset disabled={loading} class="auto-grid">
						<FormField {form} name="bio.first_name">
							<InputField
								label="First Name"
								showClear
								type="text"
								required
								bind:value={$formData.bio.first_name}
							/>
						</FormField>
						<FormField {form} name="bio.last_name">
							<InputField
								label="Last Name"
								showClear
								type="text"
								required
								bind:value={$formData.bio.last_name}
							/>
						</FormField>
						<FormField {form} name="bio.other_name">
							<InputField
								label="Other Name"
								showClear
								type="text"
								required
								bind:value={$formData.bio.other_name}
							/>
						</FormField>
						<FormField {form} name="bio.gender">
							<SelectField
								label="Gender"
								type="single"
								placeholder="select gender"
								selectables={genderItem}
								required
								bind:value={$formData.bio.gender}
							/>
						</FormField>
						<FormField {form} name="bio.date_of_birth">
							<DateField
								label="Date of birth"
								placeholder="January 01 2001"
								bind:value={$formData.bio.date_of_birth}
								max={new SvelteDate()}
								required
							/>
						</FormField>
						<FormField {form} name="bio.nin">
							<InputField
								label="NIN (optional)"
								name="nin"
								showClear
								type="text"
								bind:value={$formData.bio.nin}
							/>
						</FormField>
						<Button type="submit" size="lg" disabled={loading || !hasChanges} isLoading={loading}>
							Register
						</Button>
					</fieldset>
				</form>
			{/if}
		</div>
	</CardContent>
</Card>
