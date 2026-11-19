<script lang="ts" module>
	interface BedCountsProps {
		beds: BedOverview;
	}
</script>

<script lang="ts">
	let { beds }: BedCountsProps = $props();
	const counts = $derived([
		{ label: 'Occupied', value: beds.occupied_beds, color: 'bg-red-500' },
		{ label: 'Available', value: beds.available_beds, color: 'bg-green-500' },
		{ label: 'Cleaning', value: beds.cleaning_beds, color: 'bg-sky-500' },
		{ label: 'Maintenance', value: beds.maintenance_beds, color: 'bg-amber-500' },
		{ label: 'Inactive', value: beds.inactive_beds, color: 'bg-gray-400' }
	]);
</script>

<div class="flex flex-wrap gap-x-4 gap-y-2 text-xs">
	{#each counts as count (count.label)}
		<span class="flex items-center gap-1.5">
			<span class="size-2 rounded-full {count.color}" aria-hidden="true"></span>
			{count.value}
			{count.label}
		</span>
	{/each}
</div>
