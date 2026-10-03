import { z } from 'zod';
import { SvelteDate } from 'svelte/reactivity';

export const PatientBioSchema = z.object({
	first_name: z.string().trim(),
	last_name: z.string().trim(),
	other_name: z.string().trim(),
	gender: z.string().trim(),
	date_of_birth: z
		.date({ error: 'Date Established is needed.' })
		.transform((args) => new SvelteDate(args)),
	nin: z.string().trim().nullable().default(null)
});

export const PatientDetailsSchema = z.object({
	nationality: z.string().trim(),
	state_of_origin: z.string().trim(),
	lga_of_origin: z.string().trim(),
	religion: z.string().trim(),
	occupation: z.string().trim(),
	education_level: z.string().trim()
});

export const PatientAddressSchema = z.object({
	address: z.string().trim(),
	lga: z.string().trim(),
	state: z.string().trim(),
	country: z.string().trim(),
	zip_code: z.string().trim(),
	is_current: z.boolean()
});

export const PatientContactSchema = z.object({
	email: z.email().trim(),
	primary_phone: z.string().trim(),
	secondary_phone: z.string().trim(),
	is_primary: z.boolean()
});

export const PatientInsuranceSchema = z.object({
	insurance_type: z.string().trim(),
	provider_name: z.string().trim(),
	enrollee_id: z.string().trim(),
	plan_name: z.string().trim(),
	is_primary: z.boolean()
});

export const PatientEmergencyContactSchema = z.object({
	role: z.string().trim(),
	priority: z.number(),
	full_name: z.string().trim(),
	relationship_to_patient: z.string().trim(),
	email: z.email().trim().optional(),
	primary_phone: z.string().trim(),
	secondary_phone: z.string().trim(),
	street_address: z.string().trim()
});

export const PatientRegSchema = z.object({
	bio: PatientBioSchema,
	contact: PatientContactSchema.nullable().default(null),
	address: PatientAddressSchema.nullable().default(null),
	details: PatientDetailsSchema.nullable().default(null),
	next_of_kin: PatientEmergencyContactSchema.nullable().default(null),
	first_emergency_contact: PatientEmergencyContactSchema.nullable().default(null),
	second_emergency_contact: PatientEmergencyContactSchema.nullable().default(null),
	insurance: PatientInsuranceSchema.nullable().default(null)
});

export type PatientBio = z.infer<typeof PatientBioSchema>;
export type PatientReg = z.infer<typeof PatientRegSchema>;
