interface UserProfileItem extends BaseItem {
	email: string;
	first_name: string;
	last_name: string;
	middle_name: string;
	phone: string;
	gender: string;
	profile_photo_url: string;
	designation: string;
	is_email_verified: boolean;
	last_login_at: string;
	branch_assignments: Array<BranchAssignmentItem>;
	alternative_phone: string | null;
	prefered_name: string | null;
	license_no: string | null;
	is_active: boolean;
	password_changed_at: string | null;
	locked_until_at: string | null;
	dob: string | null;
}
