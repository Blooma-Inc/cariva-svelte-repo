import {
	parseDateTime,
	parseTime,
	type CalendarDateTime,
	type Time
} from '@internationalized/date';

export type ScheduleFieldType = 'time' | 'datetime-local';

export function parseScheduleField(value: string, type: ScheduleFieldType) {
	try {
		return value ? (type === 'time' ? parseTime(value) : parseDateTime(value)) : undefined;
	} catch {
		return undefined;
	}
}

export function serializeScheduleField(
	next: Time | CalendarDateTime | undefined,
	original: string,
	type: ScheduleFieldType
) {
	const previous = parseScheduleField(original, type);
	return next && previous && next.toString() === previous.toString()
		? original
		: (next?.toString() ?? '');
}
