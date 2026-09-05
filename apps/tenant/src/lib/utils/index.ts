import pkg from 'lodash';
const { isEqual } = pkg;

export const lowerCaseRegex = /(?=.*[a-z])\w+/;
export const upperCaseRegex = /(?=.*[A-Z])\w+/;
export const numberRegex = /\d/;
export const specialCharcterRegex = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
export const handleCharcterRegex = /[`@?&=]/;
export const looksLikePhone = (identifier: string) => /^\+?\d[\d\s\-().]+$/.test(identifier);

const isPlainObj = (val: unknown): val is Record<string, unknown> => {
	const isDate = val instanceof Date;
	return !isDate && val === 'object' && val !== null && !Array.isArray(val);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getChangedFields = <T extends Record<string, any>>(
	original: Partial<T>,
	current: T
): Partial<T> => {
	return Object.keys(current).reduce(
		(acc, key) => {
			const currentValue = current[key];
			const originalValue = original?.[key];

			if (isPlainObj(currentValue)) {
				const nestedChanges = getChangedFields(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(originalValue as Record<string, any>) ?? {},
					currentValue
				);
				if (Object.keys(nestedChanges).length > 0) {
					acc[key] = nestedChanges;
				}
			} else if (!isEqual(originalValue, currentValue)) {
				acc[key] = currentValue;
			}

			return acc;
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{} as Record<string, any>
	) as Partial<T>;
};

export function sanitizeFormData<T>(formData: Partial<T>) {
	const payload = structuredClone(formData);
	return payload as T;
}
