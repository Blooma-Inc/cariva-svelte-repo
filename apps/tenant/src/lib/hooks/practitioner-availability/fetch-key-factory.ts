import { PRACTITIONER_AVAILABILITY } from '$lib/constants/api';
const path = (branchUid: string) => PRACTITIONER_AVAILABILITY.ALL.replace(':branch_uid', branchUid);
export const practitionerAvailability = {
	all: (tenantUid: string, branchUid: string) =>
		[PRACTITIONER_AVAILABILITY.ALL, tenantUid, branchUid] as const,
	list(tenantUid: string, branchUid: string, params: PractitionerAvailabilityQueryParams) {
		const snapshot = { ...params };
		return {
			path: path(branchUid),
			params: snapshot,
			keys: () => [...practitionerAvailability.all(tenantUid, branchUid), 'list', snapshot] as const
		};
	},
	detail(tenantUid: string, branchUid: string, uid: string) {
		return {
			path: `${path(branchUid)}/${uid}`,
			keys: () => [...practitionerAvailability.all(tenantUid, branchUid), 'detail', uid] as const
		};
	},
	context(
		tenantUid: string,
		branchUid: string,
		practitionerUid: string,
		assignmentUid: string,
		offeringUid: string | null
	) {
		return {
			path: path(branchUid),
			keys: () =>
				[
					...practitionerAvailability.all(tenantUid, branchUid),
					'context',
					practitionerUid,
					assignmentUid,
					offeringUid
				] as const
		};
	}
};
