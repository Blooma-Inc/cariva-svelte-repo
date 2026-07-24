import { format, parseISO } from 'date-fns';
import type { SvelteDate } from 'svelte/reactivity';

export const formatDate = (iso: string, fmt = 'MMM d, yyyy') => {
	try {
		return format(parseISO(iso), fmt);
	} catch {
		return iso;
	}
};

export const formatDateTime = (iso: string) => formatDate(iso, 'MMM d, yyyy · h:mm a');

export const svelteDateToYearMonthDay = (svelteDateInstance: SvelteDate) => {
	const year = svelteDateInstance.getFullYear();
	const month = String(svelteDateInstance.getMonth() + 1).padStart(2, '0');
	const day = String(svelteDateInstance.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};
