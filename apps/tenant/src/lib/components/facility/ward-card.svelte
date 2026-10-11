<script lang="ts" module>
	interface WardCardProps {
		ward: WardOverview;
		selected: boolean;
		onSelect: () => void;
		onEdit?: () => void;
	}
</script>

<script lang="ts">
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BedCounts from './bed-counts.svelte';

	let { ward, selected, onSelect, onEdit }: WardCardProps = $props();
</script>

<Card class={selected ? 'border-primary ring-1 ring-primary' : ''}>
	<CardContent class="flex flex-col gap-4">
		<div class="flex items-start justify-between gap-2">
			<div>
				<Heading level="h3">{ward.name}</Heading>
				<Paragraph size="sm" muted>{ward.location_note ?? 'Location not specified'}</Paragraph>
			</div>
			{#if !ward.is_active}<Badge variant="secondary">Inactive</Badge>{/if}
		</div>
		<Paragraph size="sm">Capacity: {ward.capacity} beds</Paragraph>
		<div>
			<div class="mb-2 flex items-center justify-between gap-2 text-sm">
				<span>Occupied: {ward.beds.occupied_beds} ({ward.beds.occupancy_percentage}%)</span>
				<span>{ward.beds.available_beds} available</span>
			</div>
			<div class="h-3 overflow-hidden rounded-full bg-primary/10" aria-hidden="true">
				<div
					class="h-full rounded-full {ward.beds.occupancy_percentage >= 80
						? 'bg-amber-500'
						: 'bg-primary'}"
					style:width="{ward.beds.occupancy_percentage}%"
				></div>
			</div>
		</div>
		<BedCounts beds={ward.beds} />
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" class="w-fit" aria-pressed={selected} onclick={onSelect}>
				View beds <ArrowRightIcon class="size-4" />
			</Button>
			{#if onEdit}<Button variant="ghost" aria-label={`Edit ${ward.name}`} onclick={onEdit}
					>Edit ward</Button
				>{/if}
		</div>
	</CardContent>
</Card>
