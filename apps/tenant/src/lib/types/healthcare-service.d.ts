interface HealthcareServiceItem {
	uid: string;
	tenant_uid: string;
	name: string;
	description: string | null;
	is_active: boolean;
	created_by_uid: string;
	created_at: string;
	updated_at: string;
}
interface CreateHealthcareServicePayload {
	name: string;
	description?: string | null;
}
interface UpdateHealthcareServicePayload {
	name?: string;
	description?: string | null;
	is_active?: boolean;
}
interface HealthcareServiceQueryParams {
	q?: string;
	is_active?: boolean;
	limit: number;
	offset: number;
}
