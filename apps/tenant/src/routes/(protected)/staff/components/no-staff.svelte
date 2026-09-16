<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';

	const { AppStore, PermissionStore } = stores;
</script>

<Card>
	<CardContent>
		<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
			<div
				class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
			>
				<Heading level="h3">No Staff yet</Heading>
				<Paragraph size="sm" muted
					>You haven't added any staff to your hospital on the platform. Click "Add New Staff" to
					add your first staff.</Paragraph
				>
			</div>

			{#if PermissionStore.can(PERMISSIONS.STAFF_CREATE)}
				<Button
					size="lg"
					onclick={() =>
						AppStore.toggleModals({ open: true, name: AppModals.STAFF_FORM_MODAL, user_uid: '' })}
				>
					<PlusIcon class="size-3" />
					Add New Staff
				</Button>
			{/if}
		</div>
	</CardContent>
</Card>

<!-- eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVpZCI6IjhkOWE3ODhjLWZmMjAtNDRiMS1iYjIxLWIxZjlmYzM1YzFjNSIsImVtYWlsIjoianVkZWNhcml2YUBtYWlsc2FjLmNvbSIsImZpcnN0X25hbWUiOiJKdWRlIiwibGFzdF9uYW1lIjoiQ2FyaXZhIiwicm9sZXMiOlsiYnJhbmNoX2FkbWluIl0sInNjb3BlIjoidGVuYW50IiwidGVuYW50X3VpZCI6IjMzN2JmOTEyLWI5YTYtNGQ4My1hNDM4LWZmNmVlYThiNmJiNiIsImJyYW5jaF91aWQiOiI4OTQ1ODMzNi0wNGI4LTQwMmYtYTJiYy00YmRhNmY5YWU3OWIiLCJpc19lbWFpbF92ZXJpZmllZCI6dHJ1ZX0sImV4cCI6MTc4OTU2Mjg0NywianRpIjoiODYwYjUyMTAtN2E1MC00MzcxLTk1ZTMtMmMxY2UzN2E1NDE5IiwicmVmcmVzaCI6ZmFsc2V9.qdeJRG0_nLAVGae23tC5V4IHW9xtQl4xvm0nw0bHNzKktCcsa8hxQyzH_ZBE2nMqEAjgepbAGQ5B9fwf83KUU8wWiGYZYVcvfpFEXGmCZKrqbzwPoVafeUgNWOzHyE39JrVnZDmA7lxiJP9d1e9F6qbMpREia5gN9H-pVxMH8t1dST9eZn4dGTyRkpnFHVxUuSsjXKnhOw7N1d-3YwWbaOP0VX5daT5oW1NCpdehdGBB6PtAYRV13RjAwr0qyTSB8TajYzjRIQ9w7CfoOuYEuVZyTywJ_LfWzXwhce9eN2YZi1CuH_DHEe5SUdpIcOO70lkfmRzvD-ZNS0evMYMysPJwbDxa-GL2GCw7sSgl4hSZhBbtQXyIYF--ylm_r4YnYxEKFxO4PQmmYnPzIiawXQXmZMjyaNHZczzz2sw1UU4TlarNyFF9wIyh6BUczmQwyihIFT7EJICaJ_70QPrfROpcDjsl4iBVLLp67bCn-YWE6oTO1AuWoYgHDKwQv-46ibFASCVGQmp3NGf91aqPfpu8Oqx5mT766l5mYUyxgiBxrD8MEhDugjIdY4Ff_BsZcACae4RDAajbW7I-IFWnzXDqGQ_9earIt4nFuHZxme7qQGFRC-ZReYijqOTCixW192REarLqBnfNbYQnvBaxv7mQ4Of6oDYqhTym9p2-_3g -->
