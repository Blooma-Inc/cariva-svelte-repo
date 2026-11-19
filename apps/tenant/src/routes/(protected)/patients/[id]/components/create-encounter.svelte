<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';

	let {
		patientUid,
		branchUid,
		branchName
	}: {
		patientUid: string;
		branchUid: string;
		branchName: string;
	} = $props();

	function openModal() {
		if (!stores.PermissionStore.can(PERMISSIONS.ENCOUNTERS_CREATE)) return;
		stores.AppStore.toggleModals({
			name: AppModals.ENCOUNTER_FORM_MODAL,
			open: true,
			patient_uid: patientUid,
			branch_uid: branchUid,
			branch_name: branchName
		});
	}
</script>

<Button onclick={openModal}><PlusIcon class="size-4" />Create encounter</Button>
