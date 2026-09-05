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

interface BranchDetailedItem extends BranchItem {
	email: string | null;
	phone: string | null;
	operating_hours: string | null;
}
