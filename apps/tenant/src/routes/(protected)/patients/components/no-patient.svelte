<script lang="ts">
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
</script>

<Card>
	<CardContent>
		<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
			<div
				class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
			>
				<Heading level="h3">No Patient yet</Heading>
				<Paragraph size="sm" muted
					>You haven't added any patient to your hospital on the platform. Click "Register Patient"
					to add your first patient.</Paragraph
				>
			</div>
		</div>
	</CardContent>
</Card>
