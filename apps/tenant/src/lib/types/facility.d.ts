type WardType =
	| 'general'
	| 'maternity'
	| 'paediatric'
	| 'psychiatric'
	| 'icu'
	| 'emergency'
	| 'isolation'
	| 'private';
type WardGenderPolicy = 'mixed' | 'male' | 'female';
type BedType = 'standard' | 'icu' | 'paediatric_cot' | 'incubator' | 'trolley';
type BedStatus = 'in_service' | 'cleaning' | 'maintenance';

interface WardItem extends BaseItem {
	tenant_uid: string;
	branch_uid: string;
	name: string;
	ward_type: WardType;
	gender_policy: WardGenderPolicy;
	location_note: string | null;
	is_active: boolean;
	capacity: number;
}

interface BedOverview {
	total_beds: number;
	occupied_beds: number;
	available_beds: number;
	cleaning_beds: number;
	maintenance_beds: number;
	inactive_beds: number;
	occupancy_percentage: number;
}

interface WardOverview extends WardItem {
	beds: BedOverview;
}

interface FacilityOverview {
	total_wards: number;
	active_wards: number;
	beds: BedOverview;
	wards: WardOverview[];
}

interface BedItem extends BaseItem {
	tenant_uid: string;
	branch_uid: string;
	ward_uid: string;
	ward_name: string;
	label: string;
	room_label: string | null;
	bed_type: BedType;
	status: BedStatus;
	status_note: string | null;
	is_active: boolean;
	is_occupied: boolean;
	is_available: boolean;
}

interface BedQueryParams extends CarivaBaseQueryParams {
	ward_uid?: string;
}
