<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import CalendarPlus from '@lucide/svelte/icons/calendar-plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { appointmentBranch, canBookAppointments } from '$lib/utils/appointment-booking';
	let { patient, onOpen }: { patient?: { uid: string; label: string }; onOpen?: () => void } =
		$props();
	const context = $derived(appointmentBranch(stores));
	const allowed = $derived(canBookAppointments(stores, context?.branch_uid ?? ''));
	function open() {
		if (!allowed) return;
		onOpen?.();
		stores.AppStore.toggleModals({ name: AppModals.APPOINTMENT_FORM_MODAL, open: true, patient });
	}
</script>

{#if allowed}<Button onclick={open}><CalendarPlus class="size-3" />Book appointment</Button>{/if}
