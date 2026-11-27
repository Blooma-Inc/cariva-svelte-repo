import { describe, expect, it } from 'vitest';
import { parseDate } from '@internationalized/date';
import { appointmentWeek, appointmentDaySegments } from './appointment-calendar';
const record = (uid: string, starts_at: string, ends_at: string) =>
	({ uid, starts_at, ends_at }) as AppointmentListItem;
describe('appointment week boundaries', () => {
	it('uses Monday through the following Monday in the branch timezone', () => {
		const week = appointmentWeek(parseDate('2026-11-27'), 'Africa/Lagos');
		expect(week.days.map((day) => day.toString())).toEqual([
			'2026-11-23',
			'2026-11-24',
			'2026-11-25',
			'2026-11-26',
			'2026-11-27',
			'2026-11-28',
			'2026-11-29'
		]);
		expect(week.period_start).toBe('2026-11-22T23:00:00.000Z');
		expect(week.period_end).toBe('2026-11-29T23:00:00.000Z');
	});
	it('handles weeks crossing month and year boundaries', () => {
		const week = appointmentWeek(parseDate('2027-01-01'), 'Africa/Lagos');
		expect(week.start.toString()).toBe('2026-12-28');
		expect(week.days[6].toString()).toBe('2027-01-03');
	});
	it('uses local midnights across daylight saving changes instead of adding 168 UTC hours', () => {
		const spring = appointmentWeek(parseDate('2026-03-08'), 'America/New_York');
		const fall = appointmentWeek(parseDate('2026-11-01'), 'America/New_York');
		expect((Date.parse(spring.period_end) - Date.parse(spring.period_start)) / 3600000).toBe(167);
		expect((Date.parse(fall.period_end) - Date.parse(fall.period_start)) / 3600000).toBe(169);
	});
});
describe('calendar appointment positioning', () => {
	const day = parseDate('2026-11-24');
	it('positions appointments using the branch clock', () => {
		const [segment] = appointmentDaySegments(
			[record('a', '2026-11-24T08:00:00Z', '2026-11-24T08:30:00Z')],
			day,
			'Africa/Lagos'
		);
		expect(segment).toMatchObject({
			start: 540,
			end: 570,
			lane: 0,
			lanes: 1,
			continuesBefore: false,
			continuesAfter: false
		});
	});
	it('separates simultaneous appointments and preserves chain overlaps', () => {
		const segments = appointmentDaySegments(
			[
				record('a', '2026-11-24T08:00:00Z', '2026-11-24T09:00:00Z'),
				record('b', '2026-11-24T08:30:00Z', '2026-11-24T09:30:00Z'),
				record('c', '2026-11-24T09:00:00Z', '2026-11-24T10:00:00Z')
			],
			day,
			'Africa/Lagos'
		);
		expect(segments.map((segment) => [segment.record.uid, segment.lane, segment.lanes])).toEqual([
			['a', 0, 2],
			['b', 1, 2],
			['c', 0, 2]
		]);
	});
	it('gives adjacent appointments their full column when their visible blocks do not collide', () => {
		const segments = appointmentDaySegments(
			[
				record('a', '2026-11-24T08:00:00Z', '2026-11-24T08:30:00Z'),
				record('b', '2026-11-24T08:30:00Z', '2026-11-24T09:00:00Z')
			],
			day,
			'Africa/Lagos'
		);
		expect(segments.map((segment) => segment.lanes)).toEqual([1, 1]);
	});
	it('separates short appointments whose minimum click targets would otherwise overlap', () => {
		const segments = appointmentDaySegments(
			[
				record('a', '2026-11-24T08:00:00Z', '2026-11-24T08:05:00Z'),
				record('b', '2026-11-24T08:05:00Z', '2026-11-24T08:10:00Z')
			],
			day,
			'Africa/Lagos'
		);
		expect(segments.map((segment) => segment.lane)).toEqual([0, 1]);
	});
	it('splits overnight appointments and excludes the next day when an appointment ends exactly at midnight', () => {
		const overnight = record('a', '2026-11-23T22:30:00Z', '2026-11-24T00:00:00Z');
		const previous = appointmentDaySegments(
			[overnight],
			day.subtract({ days: 1 }),
			'Africa/Lagos'
		)[0];
		const current = appointmentDaySegments([overnight], day, 'Africa/Lagos')[0];
		expect(previous).toMatchObject({ start: 1410, end: 1440, continuesAfter: true });
		expect(current).toMatchObject({ start: 0, end: 60, continuesBefore: true });
		expect(
			appointmentDaySegments(
				[record('b', '2026-11-23T22:00:00Z', '2026-11-23T23:00:00Z')],
				day,
				'Africa/Lagos'
			)
		).toEqual([]);
	});
	it('keeps a positive visible duration during a repeated DST hour', () => {
		const [segment] = appointmentDaySegments(
			[record('a', '2026-11-01T05:45:00Z', '2026-11-01T06:15:00Z')],
			parseDate('2026-11-01'),
			'America/New_York'
		);
		expect(segment.start).toBe(105);
		expect(segment.end).toBe(135);
	});
	it('ignores invalid intervals and out-of-day records', () => {
		expect(
			appointmentDaySegments(
				[
					record('a', 'invalid', 'invalid'),
					record('b', '2026-11-24T08:00:00Z', '2026-11-24T07:00:00Z'),
					record('c', '2026-11-25T08:00:00Z', '2026-11-25T09:00:00Z')
				],
				day,
				'Africa/Lagos'
			)
		).toEqual([]);
	});
});
