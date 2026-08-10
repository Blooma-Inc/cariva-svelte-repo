interface TenantDashboardStats {
	branches_count: number;
	staff_count: number;
	patients_count: number;
}

interface CurrentTenant extends BaseItem {
	name: string;
	code: string;
	hospital_type: string;
	registration_number: string;
	date_established: string;
	website_url: string | null;
	email: string | null;
	status: string;
	onboarded_at: string | null;
}

interface BranchItem extends BaseItem {
	name: string;
	address: string;
	city: string;
	state: string;
	country: string;
	is_active: boolean;
	is_main: boolean;
	timezone: string;
}

interface TenantBranchItem extends BranchItem {
	user_count: number;
	admin: UserItem | null;
}
