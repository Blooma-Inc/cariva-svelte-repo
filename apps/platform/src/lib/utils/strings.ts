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
