interface SubscriptionItem extends BaseItem {
	plan: string;
	max_branches: number;
	max_users: number;
	duration_days: number;
	amount: string;
	is_active: boolean;
}
