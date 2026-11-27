<script lang="ts">
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { cn } from '@cariva/ui/utils';
	import { appointmentStatuses } from '$lib/utils/appointment-workspace';
	let { status }: { status: AppointmentStatus } = $props();
</script>

<Badge
	variant="secondary"
	class={cn(
		'w-fit whitespace-nowrap',
		status === 'booked' && 'bg-amber-100 text-amber-900',
		status === 'arrived' && 'bg-blue-100 text-blue-900',
		(status === 'checked-in' || status === 'fulfilled') && 'bg-primary/10 text-primary',
		(status === 'cancelled' || status === 'noshow' || status === 'entered-in-error') &&
			'bg-destructive/10 text-destructive'
	)}>{appointmentStatuses[status] ?? status}</Badge
>
