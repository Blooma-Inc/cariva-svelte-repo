import { z } from 'zod';

export const DEFAULT_WEEK_DAYS = [
	{ label: 'Monday', value: 0 },
	{ label: 'Tuesday', value: 1 },
	{ label: 'Wednesday', value: 2 },
	{ label: 'Thursday', value: 3 },
	{ label: 'Friday', value: 4 },
	{ label: 'Saturday', value: 5 },
	{ label: 'Sunday', value: 6 }
];

export function isTimezone(value: string) {
	try {
		new Intl.DateTimeFormat('en', { timeZone: value });
		return Boolean(value);
	} catch {
		return false;
	}
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const branchOperatingDay = z
	.object({
		week_day: z.number().int().min(0).max(6),
		is_enabled: z.boolean(),
		all_day: z.boolean(),
		open_time: z.string().nullable(),
		close_time: z.string().nullable()
	})
	.superRefine((day, ctx) => {
		if (!day.is_enabled || day.all_day) return;
		for (const field of ['open_time', 'close_time'] as const) {
			if (!timePattern.test(day[field] ?? '')) {
				ctx.addIssue({ code: 'custom', path: [field], message: 'Enter a time in HH:MM format.' });
			}
		}
		if (day.open_time && day.open_time === day.close_time) {
			ctx.addIssue({
				code: 'custom',
				path: ['close_time'],
				message: 'Choose a different closing time, or select All day.'
			});
		}
	});

export const branchHoursSchema = z.object({
	timezone: z.string().trim().refine(isTimezone, 'Select a valid timezone.'),
	days: z
		.array(branchOperatingDay)
		.length(7)
		.refine(
			(days) => new Set(days.map((day) => day.week_day)).size === 7,
			'Include each weekday exactly once.'
		),
	is_emergency_services: z.boolean()
});

export type BranchHoursForm = z.infer<typeof branchHoursSchema>;

export function branchHoursDefaults(
	timezone: string,
	hours?: BranchOperatingHours | null
): BranchHoursForm {
	return {
		timezone,
		days: DEFAULT_WEEK_DAYS.map(({ value }) => {
			const day = hours?.days?.find((day) => day.week_day === value);
			return {
				week_day: value,
				is_enabled: day?.is_enabled ?? false,
				all_day: day?.all_day ?? false,
				open_time: day?.open_time?.slice(0, 5) ?? null,
				close_time: day?.close_time?.slice(0, 5) ?? null
			};
		}),
		is_emergency_services: hours?.is_emergency_services ?? false
	};
}

export function branchHoursPayload(data: BranchHoursForm) {
	return {
		timezone: data.timezone,
		operating_hours: {
			is_emergency_services: data.is_emergency_services,
			days: data.days.map((day) => ({
				week_day: day.week_day,
				is_enabled: day.is_enabled,
				all_day: day.is_enabled && day.all_day,
				...(day.is_enabled && !day.all_day
					? { open_time: day.open_time, close_time: day.close_time }
					: {})
			}))
		}
	};
}
