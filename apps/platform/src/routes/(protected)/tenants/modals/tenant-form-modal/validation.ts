import { email } from '$lib/validators';
import { SvelteDate } from 'svelte/reactivity';
import { z } from 'zod';
import { type Selectables } from '@cariva/ui/components/form-inputs/select-field/index.js';

export const hospitalTypeItem: Selectables = [
	{ label: 'Hospital', value: 'hospital' },
	{ label: 'Clinic', value: 'clinic' },
	{ label: 'Rehabilitation center', value: 'rehabilitation center' },
	{ label: 'Specialist center', value: 'specialist center' },
	{ label: 'Mental health', value: 'mental health' }
];

export const CreateTenantSchema = z.object({
	name: z.string({ error: 'Tenant name is needed.' }).trim(),
	code: z.string({ error: 'Tenant code is needed.' }).trim(),
	hospital_type: z.string({ error: 'Tenant hospital type is needed.' }).trim(),
	registration_number: z.string({ error: 'Registration no is needed.' }).trim(),
	date_established: z
		.date({ error: 'Date Established is needed.' })
		.transform((args) => new SvelteDate(args)),
	website_url: z.string({ error: 'Tenant website url is needed.' }).trim(),
	email: z.string({ error: 'Tenant email is needed.' }).trim()
});

export const CreateBranchSchema = z.object({
	name: z.string({ error: 'Main branch name is needed.' }).trim().default('Main branch'),
	address: z.string({ error: 'Office address is needed.' }).trim(),
	city: z.string({ error: 'city is needed.' }).trim(),
	state: z.string({ error: 'State is needed.' }).trim(),
	country: z.string({ error: 'Country is needed.' }).trim()
});

export const CreateTenantAdminSchema = z.object({
	first_name: z.string({ error: 'Main branch name is needed.' }).trim(),
	last_name: z.string({ error: 'Office address is needed.' }).trim(),
	middle_name: z.string().trim().optional(),
	phone: z.string({ error: 'State is needed.' }).trim(),
	email
});

export const ProvisionTenantSchema = z.object({
	tenant: CreateTenantSchema,
	subscription_uid: z.string({ error: 'Select a subscription' }),
	main_branch: CreateBranchSchema,
	admin: CreateTenantAdminSchema
});

export type TProvisionTenantSchema = z.infer<typeof ProvisionTenantSchema>;
