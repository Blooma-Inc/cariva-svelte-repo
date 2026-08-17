<script lang="ts">
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
</script>

<Card class="flex flex-col gap-3 ring-0">
	<CardContent class="relative">
		<div class="absolute top-0 left-0 h-full w-1 rounded-r-lg bg-neutral-200"></div>
		<Skeleton class="h-4 w-20" />
		<div class="flex items-center justify-between">
			<Skeleton class="h-8 w-16" />
			<Skeleton class="h-11 w-11 rounded" />
		</div>
		<Skeleton class="h-4 w-28" />
	</CardContent>
</Card>
