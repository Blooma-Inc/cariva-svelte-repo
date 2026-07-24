export function ccyConverter(p: number, to: 'kobo' | 'naira') {
	if (p === 0) {
		return 0;
	}

	switch (to) {
		case 'kobo':
			return Math.round(p * 100);
		case 'naira':
			return p / 100;
		default:
			return p;
	}
}

export function ccyFormatter(p: number) {
	return new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: 'NGN',
		notation: 'standard'
	}).format(ccyConverter(p, 'naira'));
}

export function figFormatter(p: number) {
	return new Intl.NumberFormat('en-NG').format(p);
}
