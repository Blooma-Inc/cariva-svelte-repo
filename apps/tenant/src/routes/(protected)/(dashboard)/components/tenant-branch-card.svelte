<script lang="ts">
	import { getInitials } from '$lib/utils/strings';
	import * as Avatar from '@cariva/ui/components/ui/avatar/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import {
		Card,
		CardTitle,
		CardDescription,
		CardContent
	} from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import UserStarIcon from '@lucide/svelte/icons/user-star';
	import UserAvatar from '$lib/components/user-avatar.svelte';
	import { formatRelativeTime } from '$lib/utils/date';
	const { name, city, state, country, address, is_active, is_main, admin }: TenantBranchItem =
		$props();
</script>

<Card class="flex flex-col gap-3 ring-0">
	<CardContent>
		<div class="flex flex-col gap-2 divide-y">
			<div class="flex items-start justify-between">
				<div class="flex items-start justify-start gap-2 pb-3">
					<Avatar.Root class="size-16 rounded-lg">
						<Avatar.Image src="" alt="branch logo" />
						<Avatar.Fallback class="rounded-lg">{getInitials(name)}</Avatar.Fallback>
					</Avatar.Root>

					<div>
						<div class="flex items-center justify-start gap-2">
							<CardTitle>{name}</CardTitle>
							{#if is_main}
								<Badge class="bg-sky-600/30 text-[10px] text-sky-600">Main</Badge>
							{/if}
						</div>
						<CardDescription>{address}</CardDescription>
						<CardDescription>{city}, {state}, {country}</CardDescription>
					</div>
				</div>

				<Badge class="text-[10px]">{is_active ? 'Active' : 'Deactivated'}</Badge>
			</div>

			<div>
				{#if admin}
					<div class="flex flex-col gap-1">
						<Badge class="text-[10px]">Branch Admin</Badge>
						<UserAvatar
							photoUrl={admin.profile_photo_url}
							firstName={admin.first_name}
							lastName={admin.last_name}
							email={admin.email}
						/>
						<div>
							<small>last login: {formatRelativeTime(admin.last_login_at)}</small>
						</div>
					</div>
				{:else}
					<Button>
						<UserStarIcon class="size-3" />
						Assign branch admin
					</Button>
				{/if}
			</div>
		</div>
	</CardContent>
</Card>
