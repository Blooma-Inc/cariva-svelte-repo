export const PERMISSIONS = {
	PLATFORM_CREATE: 'platform.create',
	PLATFORM_READ: 'platform.read',
	PLATFORM_UPDATE: 'platform.update',
	PLATFORM_MANAGE: 'platform.manage',

	TENANTS_CREATE: 'tenants.create',
	TENANTS_READ: 'tenants.read',
	TENANTS_UPDATE: 'tenants.update',
	TENANTS_MANAGE: 'tenants.manage',

	BRANCHES_CREATE: 'branches.create',
	BRANCHES_READ: 'branches.read',
	BRANCHES_UPDATE: 'branches.update',
	BRANCHES_MANAGE: 'branches.manage',

	WARDS_CREATE: 'wards.create',
	WARDS_READ: 'wards.read',
	WARDS_UPDATE: 'wards.update',
	WARDS_DELETE: 'wards.delete',
	WARDS_MANAGE: 'wards.manage',

	BEDS_CREATE: 'beds.create',
	BEDS_READ: 'beds.read',
	BEDS_UPDATE: 'beds.update',
	BEDS_DELETE: 'beds.delete',
	BEDS_MANAGE: 'beds.manage',

	STAFF_CREATE: 'staff.create',
	STAFF_READ: 'staff.read',
	STAFF_UPDATE: 'staff.update',
	STAFF_DELETE: 'staff.delete',
	STAFF_MANAGE: 'staff.manage',

	PATIENTS_CREATE: 'patients.create',
	PATIENTS_READ: 'patients.read',
	PATIENTS_UPDATE: 'patients.update',
	PATIENTS_DELETE: 'patients.delete',
	PATIENTS_MANAGE: 'patients.manage',
	PATIENTS_REGISTRY_SEARCH: 'patient.registry_search',
	PATIENT_REGISTER: 'patient.register',

	APPOINTMENTS_CREATE: 'appointments.create',
	APPOINTMENTS_READ: 'appointments.read',
	APPOINTMENTS_UPDATE: 'appointments.update',
	APPOINTMENTS_DELETE: 'appointments.delete',
	APPOINTMENTS_MANAGE: 'appointments.manage',

	ENCOUNTERS_READ: 'encounters.read',
	ENCOUNTERS_CREATE: 'encounters.create',

	ADMISSIONS_CREATE: 'admissions.create',
	ADMISSIONS_READ: 'admissions.read',
	ADMISSIONS_UPDATE: 'admissions.update',
	ADMISSIONS_DELETE: 'admissions.delete',
	ADMISSIONS_MANAGE: 'admissions.manage',

	CLINICAL_NOTES_CREATE: 'clinical_notes.create',
	CLINICAL_NOTES_READ: 'clinical_notes.read',
	CLINICAL_NOTES_UPDATE: 'clinical_notes.update',
	CLINICAL_NOTES_MANAGE: 'clinical_notes.manage',

	DIAGNOSES_CREATE: 'diagnoses.create',
	DIAGNOSES_READ: 'diagnoses.read',
	DIAGNOSES_UPDATE: 'diagnoses.update',
	DIAGNOSES_MANAGE: 'diagnoses.manage',

	TREATMENT_PLANS_CREATE: 'treatment_plans.create',
	TREATMENT_PLANS_READ: 'treatment_plans.read',
	TREATMENT_PLANS_UPDATE: 'treatment_plans.update',
	TREATMENT_PLANS_MANAGE: 'treatment_plans.manage',

	VITALS_CREATE: 'vitals.create',
	VITALS_READ: 'vitals.read',
	VITALS_UPDATE: 'vitals.update',
	VITALS_MANAGE: 'vitals.manage',

	MEDICATIONS_CREATE: 'medications.create',
	MEDICATIONS_READ: 'medications.read',
	MEDICATIONS_UPDATE: 'medications.update',
	MEDICATIONS_DELETE: 'medications.delete',
	MEDICATIONS_MANAGE: 'medications.manage',

	PHARMACY_CREATE: 'pharmacy.create',
	PHARMACY_READ: 'pharmacy.read',
	PHARMACY_UPDATE: 'pharmacy.update',
	PHARMACY_DELETE: 'pharmacy.delete',
	PHARMACY_MANAGE: 'pharmacy.manage',

	LABORATORY_CREATE: 'laboratory.create',
	LABORATORY_READ: 'laboratory.read',
	LABORATORY_UPDATE: 'laboratory.update',
	LABORATORY_MANAGE: 'laboratory.manage',

	ASSESSMENTS_CREATE: 'assessments.create',
	ASSESSMENTS_READ: 'assessments.read',
	ASSESSMENTS_UPDATE: 'assessments.update',
	ASSESSMENTS_MANAGE: 'assessments.manage',

	RISK_CREATE: 'risk.create',
	RISK_READ: 'risk.read',
	RISK_UPDATE: 'risk.update',
	RISK_MANAGE: 'risk.manage',

	SUBSTANCE_USE_CREATE: 'substance_use.create',
	SUBSTANCE_USE_READ: 'substance_use.read',
	SUBSTANCE_USE_UPDATE: 'substance_use.update',
	SUBSTANCE_USE_MANAGE: 'substance_use.manage',

	GROUP_THERAPY_CREATE: 'group_therapy.create',
	GROUP_THERAPY_READ: 'group_therapy.read',
	GROUP_THERAPY_UPDATE: 'group_therapy.update',
	GROUP_THERAPY_MANAGE: 'group_therapy.manage',

	FAMILY_THERAPY_CREATE: 'family_therapy.create',
	FAMILY_THERAPY_READ: 'family_therapy.read',
	FAMILY_THERAPY_UPDATE: 'family_therapy.update',
	FAMILY_THERAPY_MANAGE: 'family_therapy.manage',

	REFERRALS_CREATE: 'referrals.create',
	REFERRALS_READ: 'referrals.read',
	REFERRALS_UPDATE: 'referrals.update',
	REFERRALS_MANAGE: 'referrals.manage',

	TRANSFERS_CREATE: 'transfers.create',
	TRANSFERS_READ: 'transfers.read',
	TRANSFERS_UPDATE: 'transfers.update',
	TRANSFERS_MANAGE: 'transfers.manage',

	DISCHARGE_CREATE: 'discharge.create',
	DISCHARGE_READ: 'discharge.read',
	DISCHARGE_UPDATE: 'discharge.update',
	DISCHARGE_MANAGE: 'discharge.manage',

	BILLING_CREATE: 'billing.create',
	BILLING_READ: 'billing.read',
	BILLING_UPDATE: 'billing.update',
	BILLING_MANAGE: 'billing.manage',

	RECORDS_CREATE: 'records.create',
	RECORDS_READ: 'records.read',
	RECORDS_UPDATE: 'records.update',
	RECORDS_MANAGE: 'records.manage',

	AUDIT_READ: 'audit.read',
	AUDIT_MANAGE: 'audit.manage',

	REPORTS_READ: 'reports.read',
	REPORTS_MANAGE: 'reports.manage'
} as const;
