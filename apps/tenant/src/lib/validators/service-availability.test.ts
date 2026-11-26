import { describe, expect, it } from 'vitest';
import {
	branchServiceChanges,
	branchServiceDefaults,
	branchServiceFormSchema,
	branchServicePayload,
	serviceAvailabilitySchema
} from './service-availability';

const form = () => ({
	...branchServiceDefaults(),
	service_uid: 'catalog-a',
	configure_availability: true,
	windows: [{ days: ['mon'] as ServiceWeekday[], all_day: false, start: '22:00', end: '06:00' }],
	exceptions: []
});

describe('service availability', () => {
	it('keeps overnight windows local and omits times for all-day windows', () => {
		const data = form();
		expect(branchServiceFormSchema('Africa/Lagos').safeParse(data).success).toBe(true);
		expect(
			branchServicePayload(data, 'Africa/Lagos').availability?.available_time[0]
		).toMatchObject({ available_start_time: '22:00', available_end_time: '06:00' });
		data.windows[0].all_day = true;
		expect(branchServicePayload(data, 'Africa/Lagos').availability?.available_time[0]).toEqual({
			days_of_week: ['mon'],
			all_day: true
		});
	});
	it('distinguishes clearing configuration from an explicitly empty schedule', () => {
		const data = form();
		data.windows = [];
		expect(branchServicePayload(data, 'Africa/Lagos').availability).toEqual({
			available_time: [],
			not_available_time: []
		});
		data.configure_availability = false;
		expect(branchServicePayload(data, 'Africa/Lagos').availability).toBeNull();
	});
	it('rejects duplicate or missing days, equal times, and offset-bearing recurring times', () => {
		const data = form();
		data.windows[0].days = ['mon', 'mon'];
		expect(branchServiceFormSchema('Africa/Lagos').safeParse(data).success).toBe(false);
		data.windows[0].days = [];
		expect(branchServiceFormSchema('Africa/Lagos').safeParse(data).success).toBe(false);
		data.windows[0].days = ['mon'];
		data.windows[0].start = '06:00:00';
		expect(branchServiceFormSchema('Africa/Lagos').safeParse(data).success).toBe(false);
		data.windows[0].start = '09:00+01:00';
		expect(branchServiceFormSchema('Africa/Lagos').safeParse(data).success).toBe(false);
		expect(
			serviceAvailabilitySchema.safeParse({
				available_time: [{ days_of_week: ['mon'], all_day: true, available_start_time: '09:00' }],
				not_available_time: []
			}).success
		).toBe(false);
	});
	it('converts exception instants from branch time and rejects non-positive periods', () => {
		const data = {
			...form(),
			exceptions: [{ description: ' Leave ', start: '2026-12-01T09:00', end: '2026-12-01T10:00' }]
		};
		expect(branchServiceFormSchema('Africa/Lagos').safeParse(data).success).toBe(true);
		expect(branchServicePayload(data, 'Africa/Lagos').availability?.not_available_time[0]).toEqual({
			description: 'Leave',
			during: { start: '2026-12-01T08:00:00Z', end: '2026-12-01T09:00:00Z' }
		});
		data.exceptions[0].end = data.exceptions[0].start;
		expect(branchServiceFormSchema('Africa/Lagos').safeParse(data).success).toBe(false);
	});
	it('requires explicit correction for new ambiguous or nonexistent local times', () => {
		for (const start of ['2026-03-08T02:30', '2026-11-01T01:30']) {
			const data = { ...form(), exceptions: [{ description: '', start, end: '2026-12-01T10:00' }] };
			expect(branchServiceFormSchema('America/New_York').safeParse(data).success).toBe(false);
		}
	});
	it('preserves saved exception instants through ambiguous-clock edits', () => {
		const availability = {
			available_time: [],
			not_available_time: [
				{ description: '', during: { start: '2026-11-01T05:30:00Z', end: '2026-11-01T07:00:00Z' } }
			]
		};
		const data = branchServiceDefaults(
			{
				healthcare_service_uid: 'catalog-a',
				is_active: true,
				availability
			} as unknown as BranchHealthcareServiceItem,
			'America/New_York'
		);
		expect(branchServiceFormSchema('America/New_York').safeParse(data).success).toBe(true);
		expect(
			branchServicePayload(data, 'America/New_York').availability?.not_available_time[0].during
		).toEqual(availability.not_available_time[0].during);
	});
	it('sends the whole availability when only exceptions change, and keeps status-only patches isolated', () => {
		const previous = branchServicePayload(form(), 'Africa/Lagos');
		const current = structuredClone(previous);
		current.availability!.not_available_time.push({
			during: { start: '2026-12-01T00:00:00Z', end: '2026-12-02T00:00:00Z' }
		});
		expect(branchServiceChanges(previous, current)).toEqual({ availability: current.availability });
		expect(branchServiceChanges(previous, { ...previous, is_active: false })).toEqual({
			is_active: false
		});
		expect(branchServiceChanges(previous, { ...previous, availability: null })).toEqual({
			availability: null
		});
		expect(branchServiceChanges(previous, previous)).toEqual({});
	});
});
