<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '@cariva/ui/components/ui/card/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import BookAppointment from '$lib/components/appointments/book-appointment.svelte';
</script>

<Card>
	<CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
	<CardContent class="flex flex-col items-start gap-4">
		<Paragraph size="sm" muted
			>Find an available time and book a patient visit in your branch.</Paragraph
		>
		<BookAppointment />
	</CardContent>
</Card>
