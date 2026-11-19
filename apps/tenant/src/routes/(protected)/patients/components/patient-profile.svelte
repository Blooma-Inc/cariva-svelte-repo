<script lang="ts">
	import { resolve } from '$app/paths';
	import { format, parseISO } from 'date-fns';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '@cariva/ui/components/ui/tabs/index.js';
	import * as Avatar from '@cariva/ui/components/ui/avatar/index.js';
	import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { getInitials, snakeCaseToSentenceCase } from '$lib/utils/strings';
	import ProfileSection from './profile-section.svelte';

	let { data, onNavigate }: { data: LinkedTenantPatientDetails; onNavigate?: () => void } =
		$props();
	const patient = $derived(data.patient);
	const fullName = $derived(
		[patient.first_name, patient.other_name, patient.last_name].filter(Boolean).join(' ')
	);
	const insurance = $derived(
		patient.insurances.find((item) => item.is_primary) ?? patient.insurances[0]
	);
	const details = $derived(patient.personal_detail);
</script>

<div class="flex min-w-0 flex-col gap-5">
	<div class="flex items-start gap-3 pr-6">
		<Avatar.Root class="size-16 shrink-0"
			><Avatar.Fallback class="bg-primary/10 text-lg text-primary"
				>{getInitials(fullName)}</Avatar.Fallback
			></Avatar.Root
		>
		<div class="min-w-0 space-y-1">
			<Heading level="h2" class="wrap-break-word">{fullName}</Heading>
			<Paragraph size="sm" muted>{data.patient_no}</Paragraph>
			{#if insurance?.provider_name}<Paragraph size="sm"
					><ShieldCheckIcon class="mr-1 inline size-3.5 text-primary" />Insurance on file:
					<span class="font-medium">{insurance.provider_name}</span></Paragraph
				>{/if}
		</div>
	</div>
	<div class="flex flex-wrap gap-2 border-b pb-5">
		{#if stores.PermissionStore.can(PERMISSIONS.ENCOUNTERS_READ)}
			<Button
				variant="outline"
				size="sm"
				href={resolve('/(protected)/patients/[id]/encounters', { id: data.patient_uid })}
				onclick={() => onNavigate?.()}><ClipboardListIcon class="size-4" />View encounters</Button
			>
		{/if}
		{#if stores.PermissionStore.can(PERMISSIONS.ENCOUNTERS_CREATE)}
			<Button
				size="sm"
				onclick={() => {
					const patient_uid = data.patient_uid;
					stores.AppStore.toggleModals({
						name: AppModals.ENCOUNTER_FORM_MODAL,
						open: true,
						patient_uid
					});
				}}><PlusIcon class="size-4" />Create encounter</Button
			>
		{/if}
	</div>
	<Tabs value="overview" class="min-w-0">
		<TabsList
			class="mb-4 flex w-full justify-start overflow-x-auto"
			aria-label="Patient profile sections"
		>
			<TabsTrigger value="overview">Overview</TabsTrigger>
			<TabsTrigger value="demographics">Demographics</TabsTrigger>
			<TabsTrigger value="consents">Consents</TabsTrigger>
			<TabsTrigger value="insurance">Insurance</TabsTrigger>
		</TabsList>
		<TabsContent value="overview" class="space-y-4">
			<ProfileSection
				title="Registration"
				items={[
					{ label: 'Patient number', value: data.patient_no },
					{ label: 'Registered', value: format(parseISO(data.created_at), 'dd MMM yyyy') },
					{ label: 'Registration source', value: snakeCaseToSentenceCase(data.source) },
					{ label: 'Imported patient number', value: data.imported_patient_no }
				]}
			/>
			<ProfileSection
				title="At a glance"
				items={[
					{ label: 'Date of birth', value: format(parseISO(patient.date_of_birth), 'dd MMM yyyy') },
					{ label: 'Gender', value: snakeCaseToSentenceCase(patient.gender) },
					{ label: 'Insurance provider', value: insurance?.provider_name }
				]}
			/>
		</TabsContent>
		<TabsContent value="demographics" class="space-y-4">
			<ProfileSection
				title="Personal details"
				items={[
					{ label: 'Full name', value: fullName },
					{ label: 'Date of birth', value: format(parseISO(patient.date_of_birth), 'dd MMM yyyy') },
					{ label: 'Gender', value: snakeCaseToSentenceCase(patient.gender) },
					{ label: 'Nationality', value: details?.nationality },
					{ label: 'State of origin', value: details?.state_of_origin },
					{ label: 'LGA of origin', value: details?.lga_of_origin },
					{ label: 'Religion', value: details?.religion },
					{ label: 'Occupation', value: details?.occupation },
					{ label: 'Education', value: details?.education_level }
				]}
			/>
			{#each patient.contacts as contact, index (index)}
				<ProfileSection
					title={contact.is_primary ? 'Primary contact' : 'Contact information'}
					items={[
						{ label: 'Primary phone', value: contact.primary_phone },
						{ label: 'Secondary phone', value: contact.secondary_phone },
						{ label: 'Email', value: contact.email }
					]}
				/>
			{:else}<ProfileSection
					title="Contact information"
					items={[{ label: 'Contact details', value: null }]}
				/>{/each}
			{#each patient.addresses as address, index (index)}
				<ProfileSection
					title={address.is_current ? 'Current address' : 'Address'}
					items={[
						{ label: 'Address', value: address.address },
						{ label: 'LGA', value: address.lga },
						{ label: 'State', value: address.state },
						{ label: 'Country', value: address.country },
						{ label: 'Postal code', value: address.zip_code }
					]}
				/>
			{/each}
			{#each patient.contact_persons as person, index (index)}
				<ProfileSection
					title={person.role === 'next_of_kin'
						? 'Next of kin'
						: `Emergency contact ${person.priority}`}
					items={[
						{ label: 'Name', value: person.full_name },
						{ label: 'Relationship', value: person.relationship_to_patient },
						{ label: 'Primary phone', value: person.primary_phone },
						{ label: 'Secondary phone', value: person.secondary_phone },
						{ label: 'Email', value: person.email },
						{ label: 'Address', value: person.street_address }
					]}
				/>
			{/each}
		</TabsContent>
		<TabsContent value="consents">
			<section class="rounded-xl bg-muted/40 p-5">
				<Heading level="h3">Consent records</Heading>
				<Paragraph size="sm" muted class="mt-2"
					>Consent management is not available yet. Consent status cannot be confirmed from this
					profile.</Paragraph
				>
			</section>
		</TabsContent>
		<TabsContent value="insurance" class="space-y-4">
			{#each patient.insurances as item, index (index)}
				<ProfileSection
					title={item.is_primary ? 'Primary insurance' : 'Insurance'}
					items={[
						{ label: 'Provider', value: item.provider_name },
						{ label: 'Insurance type', value: item.insurance_type },
						{ label: 'Enrollee ID', value: item.enrollee_id },
						{ label: 'Plan', value: item.plan_name }
					]}
				/>
			{:else}
				<section class="rounded-xl bg-muted/40 p-5">
					<Heading level="h3">No insurance recorded</Heading><Paragraph size="sm" muted class="mt-2"
						>Insurance details have not been added to this patient's record.</Paragraph
					>
				</section>
			{/each}
		</TabsContent>
	</Tabs>
</div>
