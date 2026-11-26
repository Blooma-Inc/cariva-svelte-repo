interface BranchOperatingHoursDay {
	week_day: number;
	is_enabled: boolean;
	all_day?: boolean;
	open_time?: string | null;
	close_time?: string | null;
}

interface BranchOperatingHours {
	days: BranchOperatingHoursDay[];
	is_emergency_services: boolean;
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

interface BranchDetailedItem extends BranchItem {
	email: string | null;
	phone: string | null;
	operating_hours: BranchOperatingHours;
}

interface BranchItemWithAdmin {
	branch: BranchDetailedItem;
	admin: UserItem | null;
}

interface BranchDashboardStats {
	patients: number;
	staff: number;
	beds: number;
}
