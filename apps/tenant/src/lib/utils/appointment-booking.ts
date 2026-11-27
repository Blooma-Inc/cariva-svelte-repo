import { parseDate } from '@internationalized/date';
import { decodeJwt } from 'jose';
import { PERMISSIONS } from '$lib/configs/permissions';
import type { RootStore } from '$lib/store/index.svelte';

type BookingStores = Pick<RootStore, 'AuthStore' | 'AppStore' | 'PermissionStore'>;
export function appointmentBranch(root: BookingStores): AppointmentBranchContext | null {
	try {
		const { user } = decodeJwt<{ user: { tenant_uid?: string; branch_uid?: string } }>(
			root.AuthStore.accessToken
		);
		if (!user?.branch_uid || user.tenant_uid !== root.AppStore.currentTenant.uid) return null;
		const assignment = root.AuthStore.user.branch_assignments?.find(
			(item) => !item.revoked_at && item.branch.uid === user.branch_uid && item.branch.is_active
		);
		return assignment
			? {
					branch_uid: user.branch_uid,
					branch_name: assignment.branch.name,
					timezone: assignment.branch.timezone
				}
			: null;
	} catch {
		return null;
	}
}
export function canReadAppointments(root: BookingStores, branchUid: string) {
	return Boolean(
		branchUid &&
		appointmentBranch(root)?.branch_uid === branchUid &&
		root.PermissionStore.can(PERMISSIONS.APPOINTMENTS_READ)
	);
}
export function canBookAppointments(root: BookingStores, branchUid: string) {
	return (
		canReadAppointments(root, branchUid) &&
		root.PermissionStore.can(PERMISSIONS.APPOINTMENTS_CREATE) &&
		root.PermissionStore.can(PERMISSIONS.PATIENTS_READ) &&
		root.PermissionStore.can(PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_READ) &&
		root.PermissionStore.can(PERMISSIONS.PRACTITIONER_AVAILABILITY_READ)
	);
}
export function appointmentDay(date: string, timezone: string): AppointmentInterval | null {
	try {
		const day = parseDate(date);
		return {
			starts_at: day.toDate(timezone).toISOString(),
			ends_at: day.add({ days: 1 }).toDate(timezone).toISOString()
		};
	} catch {
		return null;
	}
}
export function containsAppointment(intervals: AppointmentInterval[], slot: AppointmentInterval) {
	const start = Date.parse(slot.starts_at),
		end = Date.parse(slot.ends_at);
	return (
		Number.isFinite(start) &&
		end > start &&
		intervals.some(
			(interval) => Date.parse(interval.starts_at) <= start && Date.parse(interval.ends_at) >= end
		)
	);
}
export function appointmentSlots(
	intervals: AppointmentInterval[],
	day: AppointmentInterval,
	minutes: number,
	now = Date.now()
): AppointmentInterval[] {
	if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) return [];
	const duration = minutes * 60_000;
	const seen = new Set<number>();
	const slots: AppointmentInterval[] = [];
	for (const interval of intervals) {
		const begin = Math.max(Date.parse(interval.starts_at), Date.parse(day.starts_at));
		const end = Math.min(Date.parse(interval.ends_at), Date.parse(day.ends_at));
		if (!Number.isFinite(begin) || !Number.isFinite(end)) continue;
		const first = begin + Math.max(0, Math.ceil((now - begin) / duration)) * duration;
		for (let cursor = first; cursor + duration <= end && slots.length < 300; cursor += duration) {
			if (seen.has(cursor)) continue;
			seen.add(cursor);
			slots.push({
				starts_at: new Date(cursor).toISOString(),
				ends_at: new Date(cursor + duration).toISOString()
			});
		}
	}
	return slots.sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
}
export function appointmentTime(value: string, timezone: string) {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: timezone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
		timeZoneName: 'shortOffset'
	}).format(new Date(value));
}
export function appointmentPeriod(value: string, timezone: string) {
	const hour = Number(
		new Intl.DateTimeFormat('en-GB', {
			timeZone: timezone,
			hour: '2-digit',
			hourCycle: 'h23'
		}).format(new Date(value))
	);
	return hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
}

export function bookingPractitioners(records: PractitionerAvailabilityItem[], serviceUid: string) {
	return records.filter((record) => {
		if (
			record.branch_healthcare_service_uid ||
			!record.is_effectively_active ||
			!record.availability
		)
			return false;
		const specific = records.find(
			(item) =>
				item.assignment_uid === record.assignment_uid &&
				item.practitioner_uid === record.practitioner_uid &&
				item.branch_healthcare_service_uid === serviceUid
		);
		return !specific || (specific.is_effectively_active && !!specific.availability);
	});
}
