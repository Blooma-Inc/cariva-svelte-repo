import { STAFF, TENANT } from '$lib/constants/api';

export const staff = {
	getAllStaff(params: StaffQueryParams) {
		return {
			path: STAFF.ALL,
			keys: () => [TENANT.STATS, STAFF.ALL] as const,
			params
		};
	},

	getStaff(staff_uid: string) {
		return {
			path: STAFF.SINGLE.replace(':uid', staff_uid),
			keys: () => [STAFF.ALL, STAFF.SINGLE, staff_uid]
		};
	},

	getBranchStaff(branch_uid: string, params: StaffQueryParams) {
		return {
			path: STAFF.IN_BRANCH.replace(':branch_uid', branch_uid),
			keys: () => [STAFF.ALL, STAFF.IN_BRANCH, branch_uid],
			params
		};
	}
};
