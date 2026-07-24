<script>
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { useFetchTFA } from '$lib/hooks/tfa/use-fetch-tfa';
	import { formatDateTime } from '$lib/utils/date';
	import { useFetchUserProfile } from '$lib/hooks/user/use-fetch-profile';
	import { stores } from '$lib/store/index.svelte';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';

	let { AuthStore } = stores;
	const tfaQuery = useFetchTFA();
	const currentUserQuery = useFetchUserProfile();
</script>

<Card>
	<CardContent class="flex flex-col gap-3">
		<div class="flex flex-col justify-between border-b pb-2">
			<Heading level="h3">Security settings</Heading>
			<Paragraph size="sm" muted
				>Manage your password, two-factor authentication, and active sessions</Paragraph
			>
		</div>
		<div class="flex flex-col gap-2 border-b pb-3">
			<Paragraph size="sm" muted>Password</Paragraph>
			{#if currentUserQuery.status === 'success' && currentUserQuery.data}
				<Paragraph size="sm" muted
					>Last changed: {currentUserQuery.data.password_changed_at
						? formatDateTime(currentUserQuery.data.password_changed_at)
						: '-'}</Paragraph
				>
			{/if}
			<Button variant="info" class="w-fit">Change Password</Button>
		</div>
		<div class="flex flex-col gap-2 pb-3">
			<Paragraph size="sm" muted>Two-Factor Authentication</Paragraph>
			{#if tfaQuery.status === 'success'}
				{#if tfaQuery.data}
					<Paragraph size="sm" muted>
						Status: <Badge variant={tfaQuery.data?.is_enabled ? 'default' : 'warning'}
							>{tfaQuery.data?.is_enabled ? 'Enabled' : 'Disabled'}</Badge
						>
					</Paragraph>
					<Paragraph size="sm" muted
						>Enabled on: {tfaQuery.data?.enabled_at
							? formatDateTime(tfaQuery.data?.enabled_at)
							: '-'}</Paragraph
					>
					<Button variant="warning" class="w-fit">Change 2FA</Button>
				{:else}
					<Button variant="warning" class="w-fit" onclick={async () => await AuthStore.setup2FA()}
						>Enable 2FA</Button
					>
				{/if}
			{/if}
		</div>
	</CardContent>
</Card>
