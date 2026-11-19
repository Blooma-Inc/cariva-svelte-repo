import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { encounters } from './fetch-key-factory';
import { PERMISSIONS } from '$lib/configs/permissions';
import { stores } from '$lib/store/index.svelte';

export function useFetchEncounterTypes(enabled: () => boolean) {
	return createQuery(() => {
		const meta = encounters.getTypes(stores.AuthStore.user.tenant_uid);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && enabled() && stores.PermissionStore.can(PERMISSIONS.ENCOUNTERS_READ),
			select: (response: CarivaServerResp<EncounterTypeItem[]>) => response.data
		};
	});
}
