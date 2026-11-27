import pkg from 'lodash';
import { z } from 'zod';
import { Temporal } from 'temporal-polyfill';
import { isTimezone } from './branch-hours';

export const SERVICE_WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?$/;
const windowSchema = z
	.object({
		days_of_week: z
			.array(z.enum(SERVICE_WEEKDAYS))
			.min(1)
			.max(7)
			.refine((days) => new Set(days).size === days.length, 'Choose each weekday once.'),
		all_day: z.boolean(),
		available_start_time: z.string().nullable().optional(),
		available_end_time: z.string().nullable().optional()
	})
	.strict()
	.superRefine((window, ctx) => {
		if (window.all_day) {
			if (window.available_start_time || window.available_end_time)
				ctx.addIssue({ code: 'custom', message: 'All-day windows cannot include times.' });
		} else {
			for (const field of ['available_start_time', 'available_end_time'] as const)
				if (!timePattern.test(window[field] ?? ''))
					ctx.addIssue({ code: 'custom', path: [field], message: 'Enter a valid local time.' });
			if (
				window.available_start_time &&
				window.available_end_time &&
				timePattern.test(window.available_start_time) &&
				timePattern.test(window.available_end_time) &&
				Temporal.PlainTime.compare(window.available_start_time, window.available_end_time) === 0
			)
				ctx.addIssue({
					code: 'custom',
					path: ['available_end_time'],
					message: 'Choose a different end time, or select All day.'
				});
		}
	});

export const serviceAvailabilitySchema = z
	.object({
		available_time: z.array(windowSchema),
		not_available_time: z.array(
			z
				.object({
					description: z.string().nullable().optional(),
					during: z
						.object({
							start: z.iso.datetime({ offset: true }),
							end: z.iso.datetime({ offset: true })
						})
						.strict()
						.refine(
							(period) => Date.parse(period.end) > Date.parse(period.start),
							'End must be after start.'
						)
				})
				.strict()
		)
	})
	.strict();

export function exceptionInstant(value: string, timezone: string, original?: string) {
	const local = Temporal.PlainDateTime.from(value);
	if (
		original &&
		Temporal.PlainDateTime.compare(
			local,
			Temporal.Instant.from(original).toZonedDateTimeISO(timezone).toPlainDateTime()
		) === 0
	)
		return Temporal.Instant.from(original).toString();
	return local.toZonedDateTime(timezone, { disambiguation: 'reject' }).toInstant().toString();
}

export function scheduleFormSchema(timezone: string) {
	return z
		.object({
			service_uid: z.string().min(1, 'Select a service.'),
			is_active: z.boolean(),
			configure_availability: z.boolean(),
			windows: z.array(
				z.object({
					days: z.array(z.enum(SERVICE_WEEKDAYS)),
					all_day: z.boolean(),
					start: z.string(),
					end: z.string()
				})
			),
			exceptions: z.array(
				z.object({
					description: z.string(),
					start: z.string(),
					end: z.string(),
					original_start: z.string().optional(),
					original_end: z.string().optional()
				})
			)
		})
		.superRefine((data, ctx) => {
			if (!data.configure_availability) return;
			if (!isTimezone(timezone))
				ctx.addIssue({
					code: 'custom',
					path: ['configure_availability'],
					message: 'Set a valid branch timezone before configuring availability.'
				});
			for (const [index, window] of data.windows.entries()) {
				const result = windowSchema.safeParse({
					days_of_week: window.days,
					all_day: window.all_day,
					...(!window.all_day
						? { available_start_time: window.start, available_end_time: window.end }
						: {})
				});
				if (!result.success)
					for (const issue of result.error.issues) {
						const fields: Record<string, string> = {
							days_of_week: 'days',
							available_start_time: 'start',
							available_end_time: 'end'
						};
						const field = fields[String(issue.path[0])] ?? 'days';
						ctx.addIssue({
							code: 'custom',
							path: ['windows', index, field],
							message: issue.message
						});
					}
			}
			for (const [index, exception] of data.exceptions.entries()) {
				let start = '';
				let end = '';
				for (const field of ['start', 'end'] as const) {
					try {
						const instant = exceptionInstant(
							exception[field],
							timezone,
							field === 'start' ? exception.original_start : exception.original_end
						);
						if (field === 'start') start = instant;
						else end = instant;
					} catch {
						ctx.addIssue({
							code: 'custom',
							path: ['exceptions', index, field],
							message: 'Enter an unambiguous date and time in the branch timezone.'
						});
					}
				}
				if (start && end && Temporal.Instant.compare(start, end) >= 0)
					ctx.addIssue({
						code: 'custom',
						path: ['exceptions', index, 'end'],
						message: 'End must be after start.'
					});
			}
		});
}

export type ScheduleFormData = z.infer<ReturnType<typeof scheduleFormSchema>>;
export type BranchServiceFormData = ScheduleFormData;
export const branchServiceFormSchema = scheduleFormSchema;

export function scheduleDefaults(
	availability: ServiceAvailability | null,
	timezone: string,
	isActive = true,
	serviceUid = ''
): ScheduleFormData {
	const local = (value: string) =>
		Temporal.Instant.from(value)
			.toZonedDateTimeISO(timezone || 'UTC')
			.toPlainDateTime()
			.toString();
	return {
		service_uid: serviceUid,
		is_active: isActive,
		configure_availability: availability !== null,
		windows: (availability?.available_time ?? []).map((window) => ({
			days: [...window.days_of_week],
			all_day: window.all_day,
			start: window.available_start_time ?? '',
			end: window.available_end_time ?? ''
		})),
		exceptions: (availability?.not_available_time ?? []).map((exception) => ({
			description: exception.description ?? '',
			start: local(exception.during.start),
			end: local(exception.during.end),
			original_start: exception.during.start,
			original_end: exception.during.end
		}))
	};
}

export function branchServiceDefaults(
	service?: BranchHealthcareServiceItem,
	timezone = ''
): BranchServiceFormData {
	return scheduleDefaults(
		service?.availability ?? null,
		timezone,
		service?.is_active ?? true,
		service?.healthcare_service_uid ?? ''
	);
}

export function schedulePayload(
	data: ScheduleFormData,
	timezone: string
): BranchHealthcareServicePayload {
	return {
		is_active: data.is_active,
		availability: !data.configure_availability
			? null
			: {
					available_time: data.windows.map((window) => ({
						days_of_week: window.days,
						all_day: window.all_day,
						...(!window.all_day
							? { available_start_time: window.start, available_end_time: window.end }
							: {})
					})),
					not_available_time: data.exceptions.map((exception) => ({
						description: exception.description.trim() || null,
						during: {
							start: exceptionInstant(exception.start, timezone, exception.original_start),
							end: exceptionInstant(exception.end, timezone, exception.original_end)
						}
					}))
				}
	};
}

export function branchServiceChanges(
	previous: BranchHealthcareServicePayload,
	current: BranchHealthcareServicePayload
): BranchHealthcareServicePayload {
	return {
		...(previous.is_active !== current.is_active ? { is_active: current.is_active } : {}),
		...(!pkg.isEqual(previous.availability, current.availability)
			? { availability: current.availability }
			: {})
	};
}

export const branchServicePayload = schedulePayload;
export const scheduleChanges = branchServiceChanges;
