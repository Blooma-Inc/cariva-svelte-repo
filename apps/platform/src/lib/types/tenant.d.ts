interface TenantQuery extends CarivaBaseQueryParams {
	subscription_uid?: string | null;
	status?: string;
}

interface PlatformSubscriptionPlanItem extends BaseItem {
	plan: string;
	max_branches: number;
	max_users: number;
	duration_days: number;
	amount: number | string;
	is_active: boolean;
}

interface PlatformSubscriptionHistoryItem extends BaseItem {
	subscription_plan_uid: string | null;
	starts_at: string | null;
	expires_at: string | null;
	status: string;
	subscription_plan: PlatformSubscriptionPlanItem;
}

interface PlatformBranchItem extends BaseItem {
	name: string;
	address: string;
	city: string;
	state: string;
	country: string;
	is_active: boolean;
	is_main: boolean;
	timezone: string;
}

interface PlatformTenantItem extends BaseItem {
	name: string;
	code: string;
	hospital_type: string;
	registration_number: string;
	date_established: string;
	website_url: string | null;
	email: string | null;
	status: string;
	onboarded_at: string | null;
	main_branch: PlatformBranchItem | null;
	latest_subscription: PlatformSubscriptionHistoryItem;
}

interface PlatformTenantRoleItem extends BaseItem {
	code: string;
	name: string;
	description: string;
	scope: string;
	is_system: boolean;
}

interface PlatformTenantUserRoleItem extends BaseItem {
	user_uid: string;
	role_uid: string;
	role: PlatformTenantRoleItem;
}

interface PlatformTenantUserItem extends BaseItem {
	tenant_uid: string;
	email: string;
	first_name: string;
	last_name: string;
	middle_name: Optional[string];
	phone: string | null;
	last_login_at: string | null;
	gender: Optional[string];
	profile_photo_url: Optional[string];
	is_active: boolean;
	designation: Optional[string];
	user_roles: List[PlatformTenantUserRoleItem];
}

interface PlatformTenantStats {
	users: number;
	max_users: number;
	branches: number;
	max_branches: number;
}

type TenantLifecycleAction = 'activate' | 'reject' | 'suspend';

interface PlatformTenantBranchItem extends Omit<PlatformBranchItem, 'is_active' | 'timezone'> {
	tenant_uid: string;
	is_active: boolean | null;
	timezone: string | null;
	user_count: number;
	admin: PlatformTenantUserItem | null;
}
