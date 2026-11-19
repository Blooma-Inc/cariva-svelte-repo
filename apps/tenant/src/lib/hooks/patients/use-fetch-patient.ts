import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { stores } from '$lib/store/index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import { patients } from './fetch-key-factory';

export function useFetchPatient(patientUid: () => string) {
	return createQuery(() => {
		const meta = patients.getPatient(patientUid());
		return {
			queryKey: [...meta.keys(), stores.AuthStore.user.tenant_uid],
			meta,
			enabled:
				browser && Boolean(patientUid()) && stores.PermissionStore.can(PERMISSIONS.PATIENTS_READ),
			select: (response: CarivaServerResp<LinkedTenantPatientDetails>) => response.data
		};
	});
}
