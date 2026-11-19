import { FACILITY } from '$lib/constants/api';

export const facility = {
	getOverview(branch_uid: string) {
		return {
			path: FACILITY.OVERVIEW.replace(':branch_uid', branch_uid),
			keys: () => [FACILITY.OVERVIEW, branch_uid] as const
		};
	},
	getBeds(branch_uid: string, params: BedQueryParams) {
		const queryParams = { ...params };
		return {
			path: FACILITY.BEDS.replace(':branch_uid', branch_uid),
			params: queryParams,
			keys: () => [FACILITY.BEDS, branch_uid, queryParams] as const
		};
	}
};
