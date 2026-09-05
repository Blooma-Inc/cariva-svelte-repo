import { STAFF } from '$lib/constants/api';
import type { TCreateStaffSchema } from '$routes/(protected)/staff/modals/staff-form-modal.svelte';
import server from './index';

export const postStaff = async (payload: object) =>
	await server.post<CarivaServerResp<boolean>>(STAFF.ADD, payload);

export const patchStaff = async (staff_uid: string, payload: Partial<TCreateStaffSchema>) =>
	await server.patch<CarivaServerResp<boolean>>(STAFF.ADD, { ...payload, staff_uid });
