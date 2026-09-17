import { Temporal } from 'temporal-polyfill';
import type { SvelteDate } from 'svelte/reactivity';

const defaultFormat: Intl.DateTimeFormatOptions = {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
};

export const formatDate = (iso: string, fmt: Intl.DateTimeFormatOptions = defaultFormat) => {
	try {
		const instant = Temporal.Instant.from(iso);

		const timeZone = Temporal.Now.timeZoneId();
		const zonedDateTime = instant.toZonedDateTimeISO(timeZone);

		return new Intl.DateTimeFormat('en-US', fmt).format(zonedDateTime.epochMilliseconds);
	} catch {
		return iso;
	}
};

export const formatDateTime = (iso: string) => {
	try {
		const instant = Temporal.Instant.from(iso);
		const zonedDateTime = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());

		const formatter = new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});

		const parts = formatter.formatToParts(zonedDateTime.epochMilliseconds);
		const dateStr = `${parts.find((p) => p.type === 'month')?.value} ${parts.find((p) => p.type === 'day')?.value}, ${parts.find((p) => p.type === 'year')?.value}`;
		const timeStr = `${parts.find((p) => p.type === 'hour')?.value}:${parts.find((p) => p.type === 'minute')?.value} ${parts.find((p) => p.type === 'dayPeriod')?.value}`;

		return `${dateStr} · ${timeStr}`;
	} catch {
		return iso;
	}
};

export function formatRelativeTime(pastIsoString: string) {
	try {
		const timeZone = Temporal.Now.timeZoneId();

		const now = Temporal.Now.zonedDateTimeISO(timeZone);
		const past = Temporal.Instant.from(pastIsoString).toZonedDateTimeISO(timeZone);

		const diff = now.since(past, {
			largestUnit: 'days',
			smallestUnit: 'hours',
			roundingMode: 'trunc'
		});

		if (diff.days === 0) {
			const hours = diff.hours;

			if (hours < 1) {
				const minDiff = now.since(past, {
					largestUnit: 'minutes',
					smallestUnit: 'minutes',
					roundingMode: 'trunc'
				});
				return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
					-minDiff.minutes,
					'minute'
				);
			}

			return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-hours, 'hour');
		}

		if (diff.days === 1) {
			return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day');
		}

		return new Intl.DateTimeFormat('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(past.toInstant().epochMilliseconds);
	} catch {
		return pastIsoString ?? 'N/A';
	}
}

export function formatTime(timeStr: string) {
	const time = Temporal.PlainTime.from(timeStr);

	return time.toLocaleString('en-US', { timeStyle: 'short', hour12: true });
}

export const svelteDateToYearMonthDay = (svelteDateInstance: SvelteDate) => {
	const year = svelteDateInstance.getFullYear();
	const month = String(svelteDateInstance.getMonth() + 1).padStart(2, '0');
	const day = String(svelteDateInstance.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};
