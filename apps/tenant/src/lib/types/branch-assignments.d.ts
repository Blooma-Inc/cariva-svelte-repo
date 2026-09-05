interface BranchAssignmentItem extends BaseItem {
	branch_uid: string;
	user_uid: string;
	assigned_by: string;
	assigned_at: string;
	revoked_at: string | null;
	branch: BranchItem;
}
