<script lang="ts" module>
	interface IUserAvatar {
		firstName: string;
		lastName: string;
		email: string;
		photoUrl?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import * as Avatar from '@cariva/ui/components/ui/avatar/index.js';
	import { getInitials } from '$lib/utils/strings';

	let { firstName, lastName, email, photoUrl, class: className }: IUserAvatar = $props();
</script>

<div class="flex items-center justify-start gap-2">
	<Avatar.Root class={className}>
		<Avatar.Image src={photoUrl} alt={photoUrl} />
		<Avatar.Fallback class="rounded-lg">{getInitials(`${firstName} ${lastName}`)}</Avatar.Fallback>
	</Avatar.Root>
	<div class="grid flex-1 text-start text-sm leading-tight">
		<span class="truncate font-medium">{firstName} {lastName}</span>
		<span class="truncate text-xs">{email}</span>
	</div>
</div>
