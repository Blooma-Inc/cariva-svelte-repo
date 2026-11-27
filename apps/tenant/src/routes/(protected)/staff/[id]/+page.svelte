<script lang="ts">
	import { goto } from '$app/navigation';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { useFetchStaff } from '$lib/hooks/staff/use-fetch-staff.js';
	import LoginAttempts from '../components/login-attempts.svelte';
	import StaffDetails from '../components/staff-details.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ROUTES from '$lib/configs/routes.svelte';
	import StaffRecentActions from '../components/staff-recent-actions.svelte';
	import PractitionerScheduleCard from '$lib/components/scheduling/practitioner-schedule-card.svelte';

	let { data } = $props();
	const staff_uid = () => data.staff_uid;

	const staffQuery = useFetchStaff(staff_uid);
</script>

<section>
	{#if staffQuery.status === 'success' && staffQuery.data}
		<div class="flex flex-col gap-4">
			<div>
				<button class="flex items-center gap-2" onclick={() => goto(ROUTES.STAFF.resolve())}>
					<ChevronLeftIcon class="size-3" />
					<Heading level="h3">Staff Details</Heading>
				</button>
				<Paragraph muted>Staff / {staffQuery.data.last_name} {staffQuery.data.first_name}</Paragraph
				>
			</div>
			<section class="grid grid-cols-1 gap-3 md:grid-cols-[.6fr_.4fr]">
				<div class="flex flex-col gap-3">
					<LoginAttempts email={staffQuery.data.email} />
					{#key staffQuery.data.uid}<PractitionerScheduleCard
							practitioner={staffQuery.data}
						/>{/key}
					<StaffRecentActions />
				</div>

				<StaffDetails data={staffQuery.data} />
			</section>
		</div>
	{/if}
</section>
