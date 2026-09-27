import { z } from 'zod';

export const PatientRegistrySearchSchema = z.object({
	first_name: z.string().trim().optional(),
	last_name: z.string().trim().optional(),
	other_name: z.string().trim().optional(),
	gender: z.string().trim().optional(),
	patient_no: z.string().trim().optional(),
	imported_patient_no: z.string().trim().optional(),
	nin: z.string().trim().optional()
});
