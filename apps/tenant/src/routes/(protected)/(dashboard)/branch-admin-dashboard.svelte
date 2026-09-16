<script lang="ts">
	import { Paragraph, Heading } from '@cariva/ui/components/ui/typography/index.js';
	import BedDoubleIcon from '@lucide/svelte/icons/bed-double';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { stores } from '$lib/store/index.svelte';
	import ROUTES from '$lib/configs/routes.svelte';
	import BranchStatsCard, {
		type IBranchAdminDashboardStatsCardProps
	} from './components/branch-stats-card.svelte';

	const stats: Array<IBranchAdminDashboardStatsCardProps> = [
		{
			icon: UserPlusIcon,
			title: 'Patients',
			description: 'Total',
			stat: 412,
			tag: 'patients',
			meta: {
				stat: 23,
				statDescription: 'admitted today',
				routeId: ROUTES.PATIENTS.path,
				routeText: 'View Patients'
			}
		},
		{
			icon: UsersIcon,
			title: 'Staff',
			description: 'Active',
			stat: 28,
			tag: 'staff',
			meta: {
				stat: 28,
				statDescription: 'staff on duty',
				routeId: ROUTES.STAFF.path,
				routeText: 'View All Staff'
			}
		},
		{
			icon: BedDoubleIcon,
			title: 'Beds',
			description: 'Occupied',
			stat: `23/45`,
			tag: 'beds',
			meta: {
				stat: 22,
				statDescription: 'available',
				routeId: ROUTES.WARDS.path,
				routeText: 'View All Beds'
			}
		}
	];

	let { AuthStore, AppStore } = stores;
</script>

<section class="flex w-full flex-col gap-4">
	<div class="grid flex-1 text-start">
		<Heading level="h3" class="truncate">Hello, {AuthStore.user.first_name}</Heading>
		<Paragraph muted class="truncate"
			>Here is what is happening at {AppStore.currentTenant?.name}.</Paragraph
		>
	</div>

	<div class="auto-grid">
		{#each stats as stat (stat.title)}
			<BranchStatsCard {...stat} />
		{/each}
	</div>
</section>
