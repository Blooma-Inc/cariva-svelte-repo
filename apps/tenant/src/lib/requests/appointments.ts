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

export const appointmentDetailPath = (branchUid: string, uid: string) =>
	`${appointmentPath(branchUid)}/${uid}`;
export const getAppointmentDetail = (branchUid: string, uid: string) =>
	server.get<CarivaServerResp<AppointmentDetailItem>>(appointmentDetailPath(branchUid, uid));
export const patchAppointmentTime = (
	branchUid: string,
	uid: string,
	payload: AppointmentInterval
) =>
	server.patch<CarivaServerResp<AppointmentItem>>(
		`${appointmentDetailPath(branchUid, uid)}/reschedule`,
		payload
	);
export const postAppointmentAction = (
	branchUid: string,
	uid: string,
	action: Exclude<AppointmentAction, 'reschedule'>,
	payload?: object
) => {
	const suffix = {
		arrive: 'arrive',
		check_in: 'check-in',
		cancel: 'cancel',
		mark_no_show: 'no-show',
		start_encounter: 'encounters'
	}[action];
	return server.post<CarivaServerResp<unknown>>(
		`${appointmentDetailPath(branchUid, uid)}/${suffix}`,
		payload
	);
};
