<script lang="ts" module>
	import { type LucideIcon } from '@lucide/svelte';
	export interface IStatsCardProps {
		icon: LucideIcon;
		title: string;
		stat: string | number;
		description: string;
	}
</script>

<script lang="ts">
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';

	const { title, stat, description, ...rest }: IStatsCardProps = $props();
	const value = $derived(typeof stat === 'string' ? stat : stat.toLocaleString('en-US'));
</script>

<Card class="flex flex-col gap-3">
	<CardHeader class="flex items-center justify-start">
		<Button variant="outline" size="icon">
			<rest.icon class="text-neutral-600" />
		</Button>
		<CardTitle>{title}</CardTitle>
	</CardHeader>
	<CardContent>
		<Heading level="h1" class="font-light!">{value}</Heading>
	</CardContent>
	<CardFooter>
		<CardDescription>{description}</CardDescription>
	</CardFooter>
</Card>
