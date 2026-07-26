import parsePhoneNumber from 'libphonenumber-js';
import capitalize from 'lodash/capitalize';

export function snakeCaseToSentenceCase(input: string): string {
	const words = input.split('_');

	const sentence = words
		.map((word, index) =>
			index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
		)
		.join(' ');

	return sentence;
}

export function toTitleCase(p: string) {
	if (p.includes('_')) {
		return snakeCaseToSentenceCase(p);
	}

	return `${p[0].toUpperCase()}${p.slice(1).toLowerCase()}`;
}

export function getInitials(word: string) {
	const charArr = word.split(' ').map((w) => capitalize(w.charAt(0)));
	return charArr.join('');
}

export function obfuscatePhoneNo(phone: string): string {
	const phoneNumber = parsePhoneNumber(phone);
	if (!phoneNumber) return phone;

	const internationalNo = phoneNumber.formatInternational();

	let digitCount = 0;
	const totalDigits = internationalNo.replace(/\D/g, '').length;
	const targetMaskCount = totalDigits - 4;

	return internationalNo.replace(/\d/g, (match) => {
		digitCount++;
		return digitCount <= targetMaskCount ? 'X' : match;
	});
}
