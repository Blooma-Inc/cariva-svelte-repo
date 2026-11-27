import { z } from 'zod';
import { serviceAvailabilitySchema } from './service-availability';

export const practitionerScheduleUpdateSchema = z
	.object({
		is_active: z.boolean().optional(),
		availability: serviceAvailabilitySchema.nullable().optional()
	})
	.strict()
	.refine(
		(value) => value.is_active !== undefined || value.availability !== undefined,
		'Make a change before saving.'
	);
export const practitionerScheduleCreateSchema = z
	.object({
		practitioner_uid: z.string().min(1),
		branch_healthcare_service_uid: z.string().min(1).nullable(),
		is_active: z.boolean().optional(),
		availability: serviceAvailabilitySchema.nullable().optional()
	})
	.strict();
