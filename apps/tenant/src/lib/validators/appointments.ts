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

export const appointmentRescheduleSchema = z
	.object({
		starts_at: z.iso.datetime({ offset: true }),
		ends_at: z.iso.datetime({ offset: true })
	})
	.strict()
	.refine(
		(value) =>
			Date.parse(value.ends_at) > Date.parse(value.starts_at) &&
			Date.parse(value.starts_at) > Date.now(),
		'Choose a future appointment time.'
	);

export function appointmentActionSchema(action: AppointmentAction) {
	if (action === 'cancel')
		return z
			.object({
				cancellation_reason: z.string().trim().min(1, 'Provide a cancellation reason.').max(2000)
			})
			.strict();
	if (action === 'mark_no_show')
		return z.object({ no_show_reason: z.string().trim().max(2000).nullable().optional() }).strict();
	if (action === 'reschedule') return appointmentRescheduleSchema;
	if (action === 'start_encounter')
		return z
			.object({
				encounter_class: z.enum(['outpatient', 'emergency']),
				encounter_types: z.array(z.string()).max(10).optional()
			})
			.strict();
	return z.object({}).strict();
}
