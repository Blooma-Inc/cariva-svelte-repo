import { parseAbsolute, startOfWeek, type CalendarDate } from '@internationalized/date';
export function appointmentWeek(date: CalendarDate, timezone: string) {
	const start = startOfWeek(date, 'en-GB');
	return {
		start,
		days: Array.from({ length: 7 }, (_, index) => start.add({ days: index })),
		period_start: start.toDate(timezone).toISOString(),
		period_end: start.add({ days: 7 }).toDate(timezone).toISOString()
	};
}
export interface AppointmentSegment {
	record: AppointmentListItem;
	start: number;
	end: number;
	displayEnd: number;
	lane: number;
	lanes: number;
	continuesBefore: boolean;
	continuesAfter: boolean;
}
function minutes(timestamp: number, timezone: string) {
	const value = parseAbsolute(new Date(timestamp).toISOString(), timezone);
	return value.hour * 60 + value.minute + value.second / 60;
}
export function appointmentDaySegments(
	records: AppointmentListItem[],
	date: CalendarDate,
	timezone: string
): AppointmentSegment[] {
	const dayStart = date.toDate(timezone).getTime();
	const dayEnd = date.add({ days: 1 }).toDate(timezone).getTime();
	const segments = records
		.flatMap((record) => {
			const start = Date.parse(record.starts_at),
				end = Date.parse(record.ends_at);
			if (
				!Number.isFinite(start) ||
				!Number.isFinite(end) ||
				end <= start ||
				start >= dayEnd ||
				end <= dayStart
			)
				return [];
			const clippedStart = Math.max(start, dayStart),
				clippedEnd = Math.min(end, dayEnd);
			const from = minutes(clippedStart, timezone);
			const until = clippedEnd === dayEnd ? 1440 : minutes(clippedEnd, timezone);
			const wallEnd =
				until > from ? until : Math.min(1440, from + (clippedEnd - clippedStart) / 60000);
			return [
				{
					record,
					start: from,
					end: wallEnd,
					displayEnd: Math.min(1440, Math.max(wallEnd, from + 28)),
					lane: 0,
					lanes: 1,
					continuesBefore: start < dayStart,
					continuesAfter: end > dayEnd
				}
			];
		})
		.sort((a, b) => a.start - b.start || a.end - b.end || a.record.uid.localeCompare(b.record.uid));
	let group: AppointmentSegment[] = [];
	let groupEnd = 0;
	const place = () => {
		const ends: number[] = [];
		for (const segment of group) {
			let lane = ends.findIndex((end) => end <= segment.start);
			if (lane < 0) lane = ends.length;
			ends[lane] = segment.displayEnd;
			segment.lane = lane;
		}
		for (const segment of group) segment.lanes = ends.length;
	};
	for (const segment of segments) {
		if (group.length && segment.start >= groupEnd) {
			place();
			group = [];
			groupEnd = 0;
		}
		group.push(segment);
		groupEnd = Math.max(groupEnd, segment.displayEnd);
	}
	place();
	return segments;
}
export function appointmentCalendarTime(value: string, timezone: string, offset = false) {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: timezone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
		...(offset ? { timeZoneName: 'shortOffset' } : {})
	}).format(new Date(value));
}
