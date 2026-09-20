interface RoleItem extends BaseItem {
	code: string;
	name: string;
	description: string;
	scope: string;
	is_system: boolean;
	is_enabled: boolean;
}

interface UserRoleItem extends BaseItem {
	user_uid: string;
	role_uid: string;
	role: RoleItem;
}

interface PermissionItem extends BaseItem {
	code: string;
	name: string;
	module: string;
	action: string;
	description: string;
	is_enabled: boolean;
}

interface UserPermissionOverrideItem extends BaseItem {
	user_uid: string;
	permission_uid: string;
	is_granted: boolean;
	assignor_uid: string | null;
	assigned_at: string | null;
	revoker_uid: string | null;
	revoked_at: string | null;
	permission: PermissionItem;
}

type OverrideAction = 'grant' | 'revoke' | null;

interface RolePermissionMatrixItem extends BaseItem {
	role_uid: string;
	permission_uid: string;
	permission: PermissionItem;
}

interface UserPermissionsOverridePayload {
	user_uid: string;
	permissions: Array<{
		permission_uid: string;
		is_granted: boolean;
	}>;
}
