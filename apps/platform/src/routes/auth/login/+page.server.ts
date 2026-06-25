import type { PageServerLoad } from './$types.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { LoginSchema } from './validator';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(LoginSchema))
	};
};
