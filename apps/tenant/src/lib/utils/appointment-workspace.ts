import { decodeJwt } from 'jose';
import { PERMISSIONS } from '$lib/configs/permissions';
import type { RootStore } from '$lib/store/index.svelte';
import { canReadAppointments } from './appointment-booking';
type WorkspaceStores = Pick<RootStore, 'AuthStore' | 'AppStore' | 'PermissionStore'>;
export const appointmentStatuses: Record<AppointmentStatus, string> = {
	proposed: 'Proposed',
	pending: 'Pending',
	booked: 'Booked',
	arrived: 'Arrived',
	fulfilled: 'Encounter started',
	cancelled: 'Cancelled',
	noshow: 'No-show',
	'entered-in-error': 'Entered in error',
	'checked-in': 'Checked in',
	waitlist: 'Waitlist'
};
export const appointmentActionLabels: Record<AppointmentAction, string> = {
	arrive: 'Mark arrived',
	check_in: 'Check in',
	reschedule: 'Reschedule',
	cancel: 'Cancel appointment',
	mark_no_show: 'Mark no-show',
	start_encounter: 'Start encounter'
};
export function appointmentViewer(root: WorkspaceStores) {
	try {
		const actor = decodeJwt<{ user: { uid?: string } }>(root.AuthStore.accessToken).user?.uid ?? '';
		return [
			actor,
			...[
				PERMISSIONS.APPOINTMENTS_READ,
				PERMISSIONS.APPOINTMENTS_UPDATE,
				PERMISSIONS.ENCOUNTERS_CREATE
			].map((permission) => root.PermissionStore.can(permission))
		] as const;
	} catch {
		return ['', false, false, false] as const;
	}
}
export function canPerformAppointment(
	root: WorkspaceStores,
	branchUid: string,
	record: AppointmentListItem,
	action: AppointmentAction
) {
	return (
		canReadAppointments(root, branchUid) &&
		record.branch_uid === branchUid &&
		record.tenant_uid === root.AppStore.currentTenant.uid &&
		root.PermissionStore.can(PERMISSIONS.APPOINTMENTS_UPDATE) &&
		record.allowed_actions.includes(action) &&
		(action !== 'start_encounter' || root.PermissionStore.can(PERMISSIONS.ENCOUNTERS_CREATE))
	);
}
export function appointmentDateLabel(value: string, timezone: string) {
	return new Intl.DateTimeFormat('en-GB', { timeZone: timezone, dateStyle: 'medium' }).format(
		new Date(value)
	);
}
export function appointmentClock(value: string, timezone: string) {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: timezone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(new Date(value));
}
