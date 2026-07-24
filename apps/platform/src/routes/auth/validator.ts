import { email } from '$lib/validators';
import { z } from 'zod';

export const LoginSchema = z.object({
	email,
	password: z.string().min(1, 'Password is required.').trim()
});

export const ResetPasswordSchema = z
	.object({
		token: z.string({ error: 'token required' }),
		new_password: z.string().min(1, 'Password is required.').trim(),
		confirm_password: z.string().min(1, 'Password is required').trim()
	})
	.superRefine((data, ctx) => {
		const { new_password, confirm_password } = data;

		if (new_password != confirm_password) {
			ctx.addIssue({
				code: 'custom',
				path: ['confirm_password'],
				message: 'Passwords do not match.'
			});
		}
	});

export const ChangePasswordSchema = z
	.object({
		old_password: z.string().min(1, 'Password is required.').trim(),
		new_password: z.string().min(1, 'Password is required.').trim(),
		confirm_password: z.string().min(1, 'Password is required').trim()
	})
	.superRefine((data, ctx) => {
		const { new_password, confirm_password } = data;

		if (new_password != confirm_password) {
			ctx.addIssue({
				code: 'custom',
				path: ['confirm_password'],
				message: 'Passwords do not match.'
			});
		}
	});

export const TFACodeSchema = z.object({
	code: z.string({ error: 'Code is required' })
});

export const AuthSchema = z.object({
	access_token: z.string(),
	is_email_verified: z.boolean(),
	result: z.enum([
		'email_not_verified',
		'success',
		'account_locked',
		'account_inactive',
		'requires_2fa',
		'requires_password_reset'
	])
});

export type TLoginSchema = z.infer<typeof LoginSchema>;
export type TAuthSchema = z.infer<typeof AuthSchema>;
export type TResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
export type TChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;
export type TTFACodeSchema = z.infer<typeof TFACodeSchema>;
