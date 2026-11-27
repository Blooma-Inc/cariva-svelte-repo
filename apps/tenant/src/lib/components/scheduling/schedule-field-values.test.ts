import { describe, expect, it } from 'vitest';
import { CalendarDateTime, Time } from '@internationalized/date';
import { parseScheduleField, serializeScheduleField } from './schedule-field-values';

describe('schedule field values', () => {
	it('keeps unchanged local values in their original representation', () => {
		for (const value of ['09:00', '09:00:00', '09:00:12.123456']) {
			expect(serializeScheduleField(parseScheduleField(value, 'time'), value, 'time')).toBe(value);
		}
		const value = '2026-11-27T09:30:15.123';
		expect(
			serializeScheduleField(parseScheduleField(value, 'datetime-local'), value, 'datetime-local')
		).toBe(value);
	});
	it('serializes edits as local time and datetime without adding an offset', () => {
		expect(serializeScheduleField(new Time(17, 30), '09:00', 'time')).toBe('17:30:00');
		expect(
			serializeScheduleField(new CalendarDateTime(2026, 11, 28, 9, 30), '', 'datetime-local')
		).toBe('2026-11-28T09:30:00');
	});
	it('clears incomplete values and safely handles empty or invalid incoming strings', () => {
		expect(serializeScheduleField(undefined, '09:00', 'time')).toBe('');
		expect(parseScheduleField('', 'datetime-local')).toBeUndefined();
		expect(parseScheduleField('invalid', 'time')).toBeUndefined();
	});
});
