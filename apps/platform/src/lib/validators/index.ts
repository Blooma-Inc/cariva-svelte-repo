import { lowerCaseRegex, numberRegex, specialCharcterRegex, upperCaseRegex } from '$lib/utils';
import { z } from 'zod';

export const email = z.email('Invalid email address.').transform((arg) => arg.toLowerCase());

export const password = z
	.string({ error: 'Password is required.' })
	.min(8, {
		message: 'Must contain at least an uppercase, lowercase, special character and a number.'
	})
	.refine((value) => upperCaseRegex.test(value), 'Password must contain atleast an uppercase.')
	.refine((value) => numberRegex.test(value), 'Password must contain atleast a number.')
	.refine(
		(value) => specialCharcterRegex.test(value),
		'Password must contain at least a special character.'
	)
	.refine((value) => lowerCaseRegex.test(value), 'Password must contain atleast a lowercase.');
