import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { encounters } from './fetch-key-factory';
import { PERMISSIONS } from '$lib/configs/permissions';
import { stores } from '$lib/store/index.svelte';

export function useFetchPatientEncounters(
	patientUid: () => string,
	branchUid: () => string,
	params: CarivaBaseQueryParams
) {
	return createQuery(() => {
		const meta = encounters.getPatientEncounters(
			stores.AuthStore.user.tenant_uid,
			branchUid(),
			patientUid(),
			params
		);
		return {
			queryKey: meta.keys(),
			meta,
			enabled:
				browser &&
				Boolean(patientUid()) &&
				Boolean(branchUid()) &&
				stores.PermissionStore.can(PERMISSIONS.ENCOUNTERS_READ),
			select: (response: CarivaServerResp<EncounterItem[], OffsetPagination>) => response
		};
	});
}
