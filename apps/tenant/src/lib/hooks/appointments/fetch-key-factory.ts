import { appointmentPath } from '$lib/requests/appointments';
import { HEALTHCARE_SERVICES, PRACTITIONER_AVAILABILITY, PATIENTS } from '$lib/constants/api';
export const appointments = {
	all: (tenantUid: string, branchUid: string) => ['appointments', tenantUid, branchUid] as const,
	bookingContext(tenantUid: string, branchUid: string) {
		return {
			path: `${appointmentPath(branchUid)}/booking-context`,
			keys: () => [...appointments.all(tenantUid, branchUid), 'booking-context'] as const
		};
	},
	availability(tenantUid: string, branchUid: string, params: AppointmentAvailabilityParams | null) {
		const snapshot = params ? { ...params } : null;
		return {
			path: `${appointmentPath(branchUid)}/availability`,
			params: snapshot,
			keys: () => [...appointments.all(tenantUid, branchUid), 'availability', snapshot] as const
		};
	},
	options(
		tenantUid: string,
		branchUid: string,
		kind: 'services' | 'practitioners' | 'patients',
		q = ''
	) {
		const path =
			kind === 'services'
				? HEALTHCARE_SERVICES.BRANCH.replace(':branch_uid', branchUid)
				: kind === 'practitioners'
					? PRACTITIONER_AVAILABILITY.ALL.replace(':branch_uid', branchUid)
					: PATIENTS.ALL;
		return {
			path,
			params: { q: q || undefined, limit: kind === 'patients' ? 10 : 100, offset: 0 },
			keys: () => [...appointments.all(tenantUid, branchUid), 'options', kind, q] as const
		};
	}
};
