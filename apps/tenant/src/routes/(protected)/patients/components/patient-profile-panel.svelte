<script lang="ts">
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import {
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription
	} from '@cariva/ui/components/ui/sheet/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useFetchPatient } from '$lib/hooks/patients/use-fetch-patient';
	import { parseError } from '$lib/utils/errorHandler';
	import ErrorState from '$lib/components/error-state.svelte';
	import PatientProfile from './patient-profile.svelte';

	const { AppStore } = stores;
	const query = useFetchPatient(() => AppStore.patientModal.patient_uid);
	const close = () => AppStore.toggleModals({ name: AppModals.PATIENT_PROFILE_MODAL, open: false });
</script>

<SheetModal isOpen={AppStore.isOpen.PATIENT_PROFILE_MODAL} closeModal={close}>
	<SheetContent class="w-full! overflow-y-auto p-5 sm:max-w-xl! sm:p-6">
		<SheetHeader class="sr-only"
			><SheetTitle>Patient profile</SheetTitle><SheetDescription
				>Patient registration, demographics, consents and insurance.</SheetDescription
			></SheetHeader
		>
		{#if query.status === 'pending'}
			<div role="status" aria-label="Loading patient"><Skeleton class="h-72 w-full" /></div>
		{:else if query.status === 'error'}
			<ErrorState
				title="Unable to load patient"
				description={parseError(query.error)}
				onretry={query.refetch}
			/>
		{:else if query.data}
			<PatientProfile data={query.data} onNavigate={close} />
		{/if}
	</SheetContent>
</SheetModal>
