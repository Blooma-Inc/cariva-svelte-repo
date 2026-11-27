import { describe, expect, it } from 'vitest';
import {
	appointmentDay,
	appointmentSlots,
	containsAppointment,
	bookingPractitioners
} from './appointment-booking';
import { appointments } from '$lib/hooks/appointments/fetch-key-factory';
const interval = (start: string, end: string) => ({ starts_at: start, ends_at: end });
describe('appointment slot construction', () => {
	it('uses branch-local day boundaries across daylight saving changes', () => {
		const spring = appointmentDay('2026-03-08', 'America/New_York')!;
		const autumn = appointmentDay('2026-11-01', 'America/New_York')!;
		expect((Date.parse(spring.ends_at) - Date.parse(spring.starts_at)) / 3600000).toBe(23);
		expect((Date.parse(autumn.ends_at) - Date.parse(autumn.starts_at)) / 3600000).toBe(25);
		expect(appointmentDay('invalid', 'Africa/Lagos')).toBeNull();
	});
	it('splits returned intervals without spanning gaps or returning partial appointments', () => {
		const day = appointmentDay('2030-01-01', 'UTC')!;
		const slots = appointmentSlots(
			[
				interval('2030-01-01T09:00Z', '2030-01-01T09:50Z'),
				interval('2030-01-01T10:00Z', '2030-01-01T11:00Z')
			],
			day,
			30,
			0
		);
		expect(slots.map((slot) => slot.starts_at)).toEqual([
			'2030-01-01T09:00:00.000Z',
			'2030-01-01T10:00:00.000Z',
			'2030-01-01T10:30:00.000Z'
		]);
		expect(
			containsAppointment(
				[interval('2030-01-01T09:00Z', '2030-01-01T09:50Z')],
				interval('2030-01-01T09:30Z', '2030-01-01T10:00Z')
			)
		).toBe(false);
	});
	it('clips to the selected day, excludes past starts, and deduplicates intervals', () => {
		const day = appointmentDay('2030-01-01', 'UTC')!;
		const open = interval('2029-12-31T22:00Z', '2030-01-02T02:00Z');
		const slots = appointmentSlots([open, open], day, 60, Date.parse('2030-01-01T22:10Z'));
		expect(slots).toEqual([interval('2030-01-01T23:00:00.000Z', '2030-01-02T00:00:00.000Z')]);
		expect(appointmentSlots([open], day, 0)).toEqual([]);
	});
	it('isolates availability by tenant, branch, patient, practitioner, service and date', () => {
		const params = {
			...appointmentDay('2030-01-01', 'UTC')!,
			practitioner_uid: 'doctor-a',
			branch_healthcare_service_uid: 'service-a',
			patient_uid: 'patient-a'
		};
		const key = appointments.availability('tenant-a', 'branch-a', params).keys();
		for (const [field, value] of [
			['patient_uid', 'patient-b'],
			['practitioner_uid', 'doctor-b'],
			['branch_healthcare_service_uid', 'service-b'],
			['starts_at', '2030-01-02T00:00:00Z']
		] as const) {
			expect(
				appointments.availability('tenant-a', 'branch-a', { ...params, [field]: value }).keys()
			).not.toEqual(key);
		}
		expect(appointments.availability('tenant-b', 'branch-a', params).keys()).not.toEqual(key);
		expect(appointments.availability('tenant-a', 'branch-b', params).keys()).not.toEqual(key);
	});
});

describe('bookable practitioners', () => {
	it('requires configured general hours and respects inactive service overrides', () => {
		const general = {
			practitioner_uid: 'doctor-a',
			assignment_uid: 'assignment-a',
			branch_healthcare_service_uid: null,
			is_effectively_active: true,
			availability: { available_time: [], not_available_time: [] }
		} as unknown as PractitionerAvailabilityItem;
		const override = {
			...general,
			branch_healthcare_service_uid: 'service-a',
			is_effectively_active: false
		};
		expect(bookingPractitioners([override], 'service-a')).toEqual([]);
		expect(bookingPractitioners([general, override], 'service-a')).toEqual([]);
		expect(bookingPractitioners([general, override], 'service-b')).toEqual([general]);
		expect(bookingPractitioners([{ ...general, availability: null }], 'service-a')).toEqual([]);
	});
});
