interface AppointmentBranchContext {
	branch_uid: string;
	branch_name: string;
	timezone: string;
}
interface AppointmentInterval {
	starts_at: string;
	ends_at: string;
}
interface AppointmentAvailability extends AppointmentInterval {
	practitioner_uid: string;
	branch_healthcare_service_uid: string;
	timezone: string;
	intervals: AppointmentInterval[];
}
interface AppointmentAvailabilityParams extends AppointmentInterval {
	practitioner_uid: string;
	branch_healthcare_service_uid: string;
	patient_uid?: string;
}
interface CreateAppointmentPayload extends AppointmentAvailabilityParams {
	patient_uid: string;
	reason_for_visit?: string | null;
}
interface AppointmentItem extends CreateAppointmentPayload, BaseItem {
	branch_uid: string;
	tenant_uid: string;
	patient_tenant_link_uid: string;
	status:
		| 'proposed'
		| 'pending'
		| 'booked'
		| 'arrived'
		| 'fulfilled'
		| 'cancelled'
		| 'noshow'
		| 'entered-in-error'
		| 'checked-in'
		| 'waitlist';
}

interface AppointmentBookingContext {
	branch: {
		uid: string;
		name: string;
		is_active: boolean;
		timezone: string | null;
		operating_hours: BranchOperatingHours | null;
	};
}
