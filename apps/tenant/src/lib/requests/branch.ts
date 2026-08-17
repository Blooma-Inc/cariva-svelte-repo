import { BRANCH } from '$lib/constants/api';
import type { TCreateBranchSchema } from '$routes/(protected)/branches/modals/branch-form-modal.svelte';
import server from './index';

export const postBranch = async (payload: TCreateBranchSchema) =>
	await server.post<CarivaServerResp<boolean>>(BRANCH.NEW, payload);

export const patchBranch = async (branch_uid: string, payload: Partial<TCreateBranchSchema>) =>
	await server.patch<CarivaServerResp<boolean>>(BRANCH.SINGLE.replace(':uid', branch_uid), payload);
