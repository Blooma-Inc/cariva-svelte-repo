interface StaffQueryParams extends CarivaBaseQueryParams {
	role_uid?: string;
	branch_uid?: string;
	is_active?: bool;
}

interface TenantRoleItem extends BaseItem {
	code: string;
	name: string;
	description: string;
	scope: string;
	is_system: boolean;
}

interface TenantStaffRoleItem extends BaseItem {
	user_uid: string;
	role_uid: string;
	role: TenantRoleItem;
}

interface StaffItem extends BaseItem {
	tenant_uid: string;
	email: string;
	first_name: string;
	last_name: string;
	middle_name?: string;
	phone: string;
	gender?: string;
	profile_photo_url?: string;
	is_active: boolean;
	last_login_at: string;
	designation?: string;
	user_roles: Array<TenantStaffRoleItem>;
	branch_assignments: Array<BranchAssignmentItem>;
}
