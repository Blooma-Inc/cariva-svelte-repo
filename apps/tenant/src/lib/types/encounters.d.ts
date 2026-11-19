type EncounterClass = 'outpatient' | 'emergency' | 'inpatient';

type EncounterStatus =
	| 'in_progress'
	| 'discharged'
	| 'completed'
	| 'cancelled'
	| 'discontinued'
	| 'entered_in_error';

interface EncounterItem extends BaseItem {
	tenant_uid: string;
	branch_uid: string;
	patient_uid: string;
	patient_tenant_link_uid: string;
	part_of_encounter_uid: string | null;
	encounter_no: string;
	encounter_class: EncounterClass;
	encounter_types: string[];
	status: EncounterStatus;
	started_at: string;
	ended_at: string | null;
	created_by_uid: string;
	primary_practitioner_uid: string | null;
	reason_for_visit: string | null;
}

interface EncounterTypeItem {
	value: string;
	label: string;
}

interface CreateEncounterPayload {
	patient_uid: string;
	encounter_class: 'outpatient' | 'emergency';
	encounter_types: string[];
	reason_for_visit: string | null;
}
