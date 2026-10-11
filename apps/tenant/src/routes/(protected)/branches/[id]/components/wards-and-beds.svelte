<script lang="ts" module>
	interface WardsAndBedsProps {
		branchUid: string;
		branchName: string;
	}
</script>

<script lang="ts">
	import { Card, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import BedIcon from '@lucide/svelte/icons/bed';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useFetchFacilityOverview } from '$lib/hooks/facility/use-fetch-facility-overview';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { parseError } from '$lib/utils/errorHandler';
	import AccessDenied from '$lib/components/access-denied.svelte';
	import EmptyData from '$lib/components/empty-data.svelte';
	import ErrorState from '$lib/components/error-state.svelte';
	import BedCounts from '$lib/components/facility/bed-counts.svelte';
	import WardCard from '$lib/components/facility/ward-card.svelte';
	import WardBeds from '$lib/components/facility/ward-beds.svelte';

	let { branchUid, branchName }: WardsAndBedsProps = $props();
	const { PermissionStore, AppStore } = stores;
	const canRead = $derived(PermissionStore.canAll([PERMISSIONS.WARDS_READ, PERMISSIONS.BEDS_READ]));
	const query = useFetchFacilityOverview(
		() => branchUid,
		() => canRead
	);
	let selectedWardUid = $state<string | null>(null);
	const selectedWard = $derived(
		query.data?.wards.find((ward) => ward.uid === selectedWardUid) ?? query.data?.wards[0]
	);
	function openWardForm(ward: WardItem | undefined = undefined) {
		AppStore.toggleModals({
			name: AppModals.WARD_FORM_MODAL,
			open: true,
			branch_uid: branchUid,
			branch_name: branchName,
			ward
		});
	}
</script>

<section class="flex min-w-0 flex-col gap-4">
	<Card class="overflow-hidden bg-primary text-white!">
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-white/25 p-3"><BedIcon class="size-6" /></div>
					<div>
						<Heading level="h1">Wards & Beds</Heading>
						<Paragraph>
							{branchName}{query.data && canRead
								? ` has ${query.data.total_wards} wards with ${query.data.beds.total_beds} beds total`
								: ''}
						</Paragraph>
					</div>
				</div>
				{#if canRead && PermissionStore.can(PERMISSIONS.WARDS_CREATE)}
					<Button variant="secondary" onclick={() => openWardForm()}
						><PlusIcon class="size-4" />Add Ward</Button
					>
				{/if}
			</div>
		</CardHeader>
	</Card>
	{#if !canRead}
		<AccessDenied resource="wards and beds" />
	{:else if query.status === 'pending'}
		<div role="status" aria-label="Loading wards" class="grid gap-4 md:grid-cols-2">
			{#each [1, 2, 3, 4] as ward (ward)}<Skeleton class="h-56 w-full" />{/each}
		</div>
	{:else if query.status === 'error'}
		<ErrorState
			title="Failed to load wards"
			description={parseError(query.error)}
			onretry={query.refetch}
		/>
	{:else if query.data}
		{#if query.data.wards.length}
			<div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
				<Paragraph>Overall occupancy: {query.data.beds.occupancy_percentage}%</Paragraph>
				<BedCounts beds={query.data.beds} />
			</div>
			<div class="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
				<div class="grid gap-4 md:grid-cols-2">
					{#each query.data.wards as ward (ward.uid)}
						<WardCard
							{ward}
							selected={selectedWard?.uid === ward.uid}
							onSelect={() => (selectedWardUid = ward.uid)}
							onEdit={PermissionStore.can(PERMISSIONS.WARDS_UPDATE)
								? () => openWardForm(ward)
								: undefined}
						/>
					{/each}
				</div>
				{#if selectedWard}
					{#key `${branchUid}/${selectedWard.uid}`}
						<WardBeds {branchUid} ward={selectedWard} />
					{/key}
				{/if}
			</div>
		{:else}
			<Card class="p-6">
				<EmptyData
					title="No wards yet"
					description="Wards and their beds will appear here once a ward is created."
				/>
			</Card>
		{/if}
	{/if}
</section>
