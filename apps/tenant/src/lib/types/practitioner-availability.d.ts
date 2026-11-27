interface PractitionerAvailabilityItem extends BaseItem {
	tenant_uid: string;
	branch_uid: string;
	practitioner_uid: string;
	assignment_uid: string;
	branch_healthcare_service_uid: string | null;
	availability: ServiceAvailability | null;
	is_active: boolean;
	created_by_uid: string;
	practitioner_name: string;
	practitioner_is_active: boolean;
	assignment_is_active: boolean;
	branch_is_active: boolean;
	offering_is_active: boolean | null;
	catalog_is_active: boolean | null;
	service_name: string | null;
	timezone: string | null;
	is_effectively_active: boolean;
}
interface PractitionerAvailabilityQueryParams extends CarivaBaseQueryParams {
	practitioner_uid: string;
	branch_healthcare_service_uid?: string;
	general_only?: boolean;
	is_active?: boolean;
}
interface CreatePractitionerAvailabilityPayload extends BranchHealthcareServicePayload {
	practitioner_uid: string;
	branch_healthcare_service_uid: string | null;
}
interface PractitionerScheduleContext {
	branch_uid: string;
	branch_name: string;
	timezone: string;
	branch_is_active: boolean;
	practitioner_uid: string;
	practitioner_name: string;
	practitioner_is_active: boolean;
	assignment_uid: string;
	assignment_is_active: boolean;
}
