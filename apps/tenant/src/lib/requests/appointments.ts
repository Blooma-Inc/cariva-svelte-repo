import server from './index';
import { APPOINTMENTS } from '$lib/constants/api';
export const appointmentPath = (branchUid: string) =>
	APPOINTMENTS.BRANCH.replace(':branch_uid', branchUid);
export const getAppointmentAvailability = (
	branchUid: string,
	params: AppointmentAvailabilityParams,
	signal?: AbortSignal
) =>
	server.get<CarivaServerResp<AppointmentAvailability>>(
		`${appointmentPath(branchUid)}/availability`,
		{ params, signal }
	);
export const postAppointment = (branchUid: string, payload: CreateAppointmentPayload) =>
	server.post<CarivaServerResp<AppointmentItem>>(appointmentPath(branchUid), payload);
