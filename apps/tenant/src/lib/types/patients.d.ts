interface PatientRegistrySearchParams {
	first_name: string | null;
	last_name: string | null;
	other_name: string | null;
	date_of_birth: string | null;
	gender: string | null;
	patient_no: string | null;
	imported_patient_no: string | null;
	nin: string | null;
}

interface PatientSearchParams extends PatientRegistrySearchParams, CarivaBaseQueryParams {}

interface PatientTenantLinkItem extends BaseItem {
	tenant_uid: string;
	patient_uid: string;
	patient_no: string;
	imported_patient_no: string | null;
	source: string;
}

interface PatientItem extends BaseItem {
	first_name: string;
	last_name: string;
	other_name: string | null;
	date_of_birth: string;
	gender: string;
}

interface LinkedTenantPatientItem extends PatientTenantLinkItem {
	patient: PatientItem;
}

interface PatientSearchResultItem extends PatientItem {
	patient_tenant_links: Array<PatientTenantLinkItem>;
}

type PatienceMatchConfidence = 'confirmed' | 'possible' | 'ambiguous';

interface PatientExistenceCheckResult {
	exists: boolean;
	confidence: PatienceMatchConfidence | null;
	candidates: Array<PatientSearchResultItem>;
}

interface PatientProfileItem extends PatientItem {
	personal_detail: {
		nationality: string | null;
		state_of_origin: string | null;
		lga_of_origin: string | null;
		religion: string | null;
		occupation: string | null;
		education_level: string | null;
	} | null;
	contacts: Array<{
		email: string | null;
		primary_phone: string | null;
		secondary_phone: string | null;
		is_primary: boolean | null;
	}>;
	addresses: Array<{
		address: string;
		lga: string | null;
		state: string | null;
		country: string | null;
		zip_code: string | null;
		is_current: boolean;
	}>;
	contact_persons: Array<{
		role: string;
		priority: number;
		full_name: string;
		relationship_to_patient: string;
		primary_phone: string;
		secondary_phone: string | null;
		email: string | null;
		street_address: string | null;
	}>;
	insurances: Array<{
		insurance_type: string;
		provider_name: string | null;
		enrollee_id: string | null;
		plan_name: string | null;
		is_primary: boolean;
	}>;
}

interface LinkedTenantPatientDetails extends LinkedTenantPatientItem {
	patient: PatientProfileItem;
}
