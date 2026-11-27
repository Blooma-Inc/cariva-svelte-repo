import { decodeJwt } from 'jose';
import { PERMISSIONS } from '$lib/configs/permissions';
import { canAccessBranch } from './branch-service-access';
import type { RootStore } from '$lib/store/index.svelte';

type AccessStore = Pick<RootStore, 'PermissionStore' | 'AuthStore' | 'AppStore'>;
export function canReadPractitionerSchedule(
	root: AccessStore,
	branchUid: string,
	practitionerUid: string
) {
	return (
		Boolean(practitionerUid) &&
		canAccessBranch(root, branchUid, PERMISSIONS.PRACTITIONER_AVAILABILITY_READ)
	);
}
export function canWritePractitionerSchedule(
	root: AccessStore,
	branchUid: string,
	practitionerUid: string,
	create: boolean
) {
	if (
		!canReadPractitionerSchedule(root, branchUid, practitionerUid) ||
		!root.PermissionStore.can(
			create
				? PERMISSIONS.PRACTITIONER_AVAILABILITY_CREATE
				: PERMISSIONS.PRACTITIONER_AVAILABILITY_UPDATE
		)
	)
		return false;
	try {
		const actor = decodeJwt<{ user: { uid?: string } }>(root.AuthStore.accessToken).user?.uid;
		return (
			Boolean(actor) &&
			(actor === practitionerUid ||
				root.PermissionStore.can(PERMISSIONS.PRACTITIONER_AVAILABILITY_MANAGE))
		);
	} catch {
		return false;
	}
}
export function canActivatePractitionerSchedule(record: PractitionerAvailabilityItem) {
	return (
		record.practitioner_is_active &&
		record.assignment_is_active &&
		record.branch_is_active &&
		record.offering_is_active !== false &&
		record.catalog_is_active !== false
	);
}
