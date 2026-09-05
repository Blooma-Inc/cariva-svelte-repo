import { BRANCH, TENANT } from '$lib/constants/api';

export const branch = {
	getBranchByUid(branch_uid: string) {
		return {
			path: BRANCH.SINGLE.replace(':uid', branch_uid),
			keys: () => [TENANT.STATS, TENANT.BRANCHES, BRANCH.NEW, BRANCH.SINGLE, branch_uid] as const
		};
	}
};
