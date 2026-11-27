<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { untrack } from 'svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { AppointmentFormData } from '$lib/validators/appointments';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';

	import { useBookingOptions } from '$lib/hooks/appointments/use-appointment-booking';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte';
	import { parseError } from '$lib/utils/errorHandler';
	let {
		form,
		branchUid,
		label = $bindable(''),
		loading = $bindable(false)
	}: {
		form: SuperForm<AppointmentFormData>;
		branchUid: string;
		label: string;
		loading?: boolean;
	} = $props();
	const { form: data } = untrack(() => form);
	const search = useDebounce(() => $data.patient_search.trim());
	const query = useBookingOptions(
		() => branchUid,
		'patients',
		() => search.value
	);
	const options = $derived([
		...($data.patient_uid && label ? [{ value: $data.patient_uid, label, enable: true }] : []),
		...(query.data ?? [])
			.filter((item) => item.patient_uid !== $data.patient_uid || !label)
			.map((item) => ({
				value: item.patient_uid,
				label: `${item.patient.first_name} ${item.patient.last_name} · ${item.patient_no}`,
				enable: true
			}))
	]);
	$effect(() => {
		loading = query.isFetching;
	});
	$effect(() => {
		const found = query.data?.find((item) => item.patient_uid === $data.patient_uid);
		if (found)
			label = `${found.patient.first_name} ${found.patient.last_name} · ${found.patient_no}`;
	});
</script>

<FormField {form} name="patient_search"
	><InputField
		label="Find patient"
		placeholder="Search by name or patient number"
		bind:value={$data.patient_search}
	/></FormField
>
{#if loading}<Skeleton class="h-16 w-full" aria-label="Searching patients" />
{:else if query.isError}<EmptyState
		compact
		kind="error"
		title="Couldn’t load patients"
		description={parseError(query.error)}
		onAction={() => {
			void query.refetch();
		}}
	/>
{:else}<FormField {form} name="patient_uid"
		><SelectField
			type="single"
			label="Patient"
			placeholder="Select a patient"
			selectables={options}
			bind:value={$data.patient_uid}
		/></FormField
	>
	<p class="text-xs text-muted-foreground">
		Showing up to 10 matching patients. Refine the search if needed.
	</p>
	{#if !options.length}<EmptyState
			compact
			kind={search.value ? 'no-results' : 'empty'}
			title={search.value ? 'No matching patients' : 'No patients available'}
			description="Patients must be registered before booking. Try another search if the patient is already registered."
		/>{/if}{/if}
