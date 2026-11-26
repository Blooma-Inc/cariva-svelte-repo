type ServiceWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
interface ServiceAvailability {
	available_time: {
		days_of_week: ServiceWeekday[];
		all_day: boolean;
		available_start_time?: string | null;
		available_end_time?: string | null;
	}[];
	not_available_time: { description?: string | null; during: { start: string; end: string } }[];
}
interface BranchHealthcareServiceItem {
	uid: string;
	tenant_uid: string;
	branch_uid: string;
	healthcare_service_uid: string;
	name: string;
	is_active: boolean;
	catalog_is_active: boolean;
	branch_is_active: boolean;
	is_effectively_active: boolean;
	timezone: string | null;
	availability: ServiceAvailability | null;
	created_by_uid: string;
	created_at: string;
	updated_at: string;
}
interface BranchHealthcareServicePayload {
	is_active?: boolean;
	availability?: ServiceAvailability | null;
}
