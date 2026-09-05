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

interface TenantBranchItem extends BranchItem {
	user_count: number;
	admin: UserItem | null;
}
