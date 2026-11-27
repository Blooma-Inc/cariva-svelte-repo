import { describe, expect, it } from 'vitest';
import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
import {
  combineDateTime,
  dateTimeBoundary,
  dateError
} from '../src/lib/components/date-fields/shared.js';

describe('local date and time values', () => {
  it('requires both parts without assuming midnight', () => {
    expect(combineDateTime(new CalendarDate(2026, 11, 27), undefined)).toBeUndefined();
    expect(combineDateTime(undefined, new Time(9))).toBeUndefined();
  });
  it('preserves wall-clock values and seconds without converting through a timezone', () => {
    const date = new CalendarDate(2026, 11, 27);
    const time = new Time(0, 30, 45);
    expect(combineDateTime(date, time)?.toString()).toBe('2026-11-27T00:30:45');
    expect(combineDateTime(date.add({ days: 1 }), time)?.toString()).toBe('2026-11-28T00:30:45');
  });
  it('applies time bounds only on the corresponding boundary date', () => {
    const limit = new CalendarDateTime(2026, 11, 27, 9, 30, 15);
    expect(dateTimeBoundary(new CalendarDate(2026, 11, 27), limit)?.toString()).toBe('09:30:15');
    expect(dateTimeBoundary(new CalendarDate(2026, 11, 28), limit)).toBeUndefined();
  });
  it('keeps inclusive date bounds and validates typed restricted endpoints', () => {
    const date = new CalendarDate(2026, 11, 27);
    expect(dateError(date, date, date)).toBe('');
    expect(dateError(date.subtract({ days: 1 }), date)).toContain('on or after');
    expect(dateError(date.add({ days: 1 }), undefined, date)).toContain('on or before');
    expect(dateError(date, undefined, undefined, () => true)).toContain('unavailable');
    expect(dateError(date, undefined, undefined, undefined, () => true)).toContain('unavailable');
  });
});
