import { format, parseISO } from 'date-fns';

export const formatDate = (iso: string, fmt = 'MMM d, yyyy') => {
	try {
		return format(parseISO(iso), fmt);
	} catch {
		return iso;
	}
};

export const formatDateTime = (iso: string) => formatDate(iso, 'MMM d, yyyy · h:mm a');
