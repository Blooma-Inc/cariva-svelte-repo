import { email } from '$lib/validators';
import { z } from 'zod';

export const LoginSchema = z.object({
	email,
	password: z.string().min(1, 'Password is required.').trim()
});

export type TLoginSchema = z.infer<typeof LoginSchema>;
