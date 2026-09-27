type Enable2FA = {
	secret: string;
	qr_code_url: string;
};

interface SessionItem extends BaseItem {
	user_uid: string;
	ip_address: string;
	user_agent: string;
	device_finger_print: string;
	expires_at: string;
	revoked_at: string;
}

interface UserItem extends BaseItem {
	email: string;
	first_name: string;
	last_name: string;
	middle_name: string;
	phone: string;
	gender: string;
	profile_photo_url: string;
	designation: string | null;
	is_email_verified: boolean;
	last_login_at: string;
}

interface CurrentUserItem extends UserItem {
	tenant_uid: string;
	last_login_at: string;
	user_roles: Array<UserRoleItem>;
	branch_assignments: Array<BranchAssignmentItem>;
}
