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
