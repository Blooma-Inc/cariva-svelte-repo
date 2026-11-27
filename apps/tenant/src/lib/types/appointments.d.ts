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
	exclude_appointment_uid?: string;
	practitioner_uid: string;
	branch_healthcare_service_uid: string;
	patient_uid?: string;
}
interface CreateAppointmentPayload extends Omit<
	AppointmentAvailabilityParams,
	'exclude_appointment_uid'
> {
	patient_uid: string;
	reason_for_visit?: string | null;
}
interface AppointmentItem
	extends Omit<CreateAppointmentPayload, 'branch_healthcare_service_uid'>, BaseItem {
	branch_healthcare_service_uid: string | null;
	created_by_uid?: string;
	arrived_at?: string | null;
	checked_in_at?: string | null;
	rescheduled_at?: string | null;
	cancelled_at?: string | null;
	cancellation_reason?: string | null;
	no_show_at?: string | null;
	no_show_reason?: string | null;
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

type AppointmentStatus = AppointmentItem['status'];
type AppointmentAction =
	| 'arrive'
	| 'check_in'
	| 'reschedule'
	| 'cancel'
	| 'mark_no_show'
	| 'start_encounter';
interface AppointmentPersonSummary {
	uid: string;
	display_name: string;
}
interface AppointmentPatientSummary extends AppointmentPersonSummary {
	patient_no: string;
}
interface AppointmentServiceSummary {
	branch_healthcare_service_uid: string;
	healthcare_service_uid: string;
	name: string;
}
interface AppointmentListItem extends AppointmentItem {
	patient: AppointmentPatientSummary | null;
	practitioner: AppointmentPersonSummary | null;
	service: AppointmentServiceSummary | null;
	allowed_actions: AppointmentAction[];
}
interface AppointmentDetailItem extends AppointmentListItem {
	created_by: AppointmentPersonSummary | null;
}
interface AppointmentListParams extends CarivaBaseQueryParams {
	period_start?: string;
	period_end?: string;
	status?: AppointmentStatus;
	patient_uid?: string;
	practitioner_uid?: string;
	branch_healthcare_service_uid?: string;
}
interface AppointmentSummaryParams {
	date: string;
	q?: string;
	patient_uid?: string;
	practitioner_uid?: string;
	branch_healthcare_service_uid?: string;
}
interface AppointmentDailySummary {
	branch_uid: string;
	date: string;
	timezone: string;
	period_start: string;
	period_end: string;
	as_of: string;
	total: number;
	counts_by_status: Record<AppointmentStatus, number>;
	next_expected: Pick<
		AppointmentListItem,
		'uid' | 'starts_at' | 'ends_at' | 'status' | 'patient' | 'practitioner' | 'service'
	> | null;
}

type AppointmentWeekParams = Omit<
	AppointmentListParams,
	'limit' | 'offset' | 'period_start' | 'period_end'
> & { period_start: string; period_end: string };
