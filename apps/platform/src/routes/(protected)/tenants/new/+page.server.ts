import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { ProvisionTenantSchema } from './validation';

export const load = async () => {
	return {
		form: await superValidate(zod4(ProvisionTenantSchema))
	};
};
