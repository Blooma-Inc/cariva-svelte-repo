<script lang="ts">
	import { Paragraph, Heading } from '@cariva/ui/components/ui/typography/index.js';
	import BedDoubleIcon from '@lucide/svelte/icons/bed-double';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { stores } from '$lib/store/index.svelte';
	import BranchStatsCard, {
		type IBranchAdminDashboardStatsCardProps
	} from './branch-stats-card.svelte';
	import Appointments from './appointments.svelte';
	import RecentActivity from '../components/recent-activity.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ROUTES from '$lib/configs/routes.svelte';
	import { goto } from '$app/navigation';
	import WardOccupany from './ward-occupany.svelte';

	const stats: Array<IBranchAdminDashboardStatsCardProps> = [
		{
			icon: UserPlusIcon,
			title: 'Patients',
			description: 'Total',
			stat: 0,
			tag: 'patients',
			meta: {
				stat: 0,
				statDescription: 'admitted today',
				routeId: ROUTES.PATIENTS.path,
				routeText: 'View Patients'
			}
		},
		{
			icon: UsersIcon,
			title: 'Staff',
			description: 'Active',
			stat: 0,
			tag: 'staff',
			meta: {
				stat: 0,
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
				stat: 0,
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

	<div class="grid h-full grid-cols-1 gap-3 lg:grid-cols-6">
		<div class="col-span-4 grid grid-cols-1 gap-3">
			<div class="auto-grid">
				{#each stats as stat (stat.title)}
					<BranchStatsCard {...stat} />
				{/each}
			</div>

			<RecentActivity />

			<div class="flex w-full flex-col gap-2">
				<div class="flex items-center justify-between">
					<Heading level="h3">Quick Actions</Heading>
				</div>

				<div class="flex flex-wrap items-center justify-start gap-2">
					<Button size="lg">
						<PlusIcon class="size-3" /> Register Patient
					</Button>
					<Button
						variant="outline"
						size="lg"
						onclick={() => {
							goto(ROUTES.WARDS.resolve());
						}}>Manage wards</Button
					>
					<Button
						variant="outline"
						size="lg"
						onclick={() => {
							goto(ROUTES.AUDIT_LOGS.resolve());
						}}>View Audit Logs</Button
					>
				</div>
			</div>

			<WardOccupany />
		</div>

		<div class="col-span-4 lg:col-span-2">
			<Appointments />
		</div>
	</div>
</section>
