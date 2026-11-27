import { z } from 'zod';
export const appointmentPayloadSchema = z
	.object({
		patient_uid: z.uuid('Select a patient.'),
		practitioner_uid: z.uuid('Select a practitioner.'),
		branch_healthcare_service_uid: z.uuid('Select a service.'),
		starts_at: z.iso.datetime({ offset: true }),
		ends_at: z.iso.datetime({ offset: true }),
		reason_for_visit: z.string().trim().max(2000).nullable().optional()
	})
	.strict()
	.refine((value) => Date.parse(value.ends_at) > Date.parse(value.starts_at), {
		path: ['ends_at'],
		message: 'The appointment must end after its start.'
	});
export const appointmentFormSchema = z.object({
	patient_uid: z.uuid('Select a patient.'),
	practitioner_uid: z.uuid('Select a practitioner.'),
	branch_healthcare_service_uid: z.uuid('Select a service.'),
	date: z.iso.date('Select a date.'),
	duration: z.number().int().min(5).max(480),
	patient_search: z.string(),
	reason_for_visit: z.string().trim().max(2000)
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
