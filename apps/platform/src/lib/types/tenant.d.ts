interface TenantQuery extends CarivaBaseQuery {
	subscription_uid?: string | null;
	status?: string;
}

interface PlatformSubscriptionPlanItem extends BaseItem {
	plan: string;
	max_branches: number;
	max_users: number;
	duration_days: number;
	amount: number;
	is_active: boolean;
}

interface PlatformSubscriptionHistoryItem extends BaseItem {
	subscription_plan_uid: string | null;
	starts_at: string | null;
	expires_at: string | null;
	status: string;
	subscription_plan: PlatformSubscriptionPlanItem;
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
	latest_subscription: PlatformSubscriptionHistoryItem;
}
