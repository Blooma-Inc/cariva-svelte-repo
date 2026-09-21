import { patchStaff, postStaff, postResetStaffPwd } from '$lib/requests/staff';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import type { TCreateStaffSchema } from '$routes/(protected)/staff/modals/staff-form-modal.svelte';
import type { SvelteDate } from 'svelte/reactivity';
import type { RootStore } from '../index.svelte';
import { toast } from '@cariva/ui/components/toast/index.js';

const INIT_IS_LOADING = {
	isStaffLoading: false
};

class StaffStore {
	rootStore: RootStore;

	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(_rootStore: RootStore) {
		this.rootStore = _rootStore;
	}

	async createStaff(payload: TCreateStaffSchema, cb?: () => void) {
		this.loaders.isStaffLoading = false;
		this.errors.isStaffLoading = '';
		const { branch_uid, role_uid, ...staffBio } = payload;
		try {
			const bio: Omit<TCreateStaffSchema, 'branch_uid' | 'role_uid'> = {
				...staffBio,
				dob: staffBio.dob.toISOString().split('T')[0] as unknown as SvelteDate
			};
			await postStaff({ bio, branch_uid, role_uid });
			toast.success('Staff created successfully!');
			cb?.();
		} catch (error) {
			this.errors.isStaffLoading = parseError(error);
			toast.error(this.errors.isStaffLoading);
		} finally {
			this.loaders.isStaffLoading = false;
		}
	}

	async editStaff(staff_uid: string, payload: Partial<TCreateStaffSchema>, cb?: () => void) {
		this.loaders.isStaffLoading = false;
		this.errors.isStaffLoading = '';

		try {
			await patchStaff(staff_uid, payload);
			toast.success('Staff updated successfully!');
			cb?.();
		} catch (error) {
			this.errors.isStaffLoading = parseError(error);
			toast.error(this.errors.isStaffLoading);
		} finally {
			this.loaders.isStaffLoading = false;
		}
	}

	async resetStaffPassword(user_uid: string, cb?: () => void) {
		this.loaders.isStaffLoading = false;
		this.errors.isStaffLoading = '';

		try {
			await postResetStaffPwd(user_uid);
			toast.success('Password reset initiated!');
			cb?.();
		} catch (error) {
			this.errors.isStaffLoading = parseError(error);
			toast.error(this.errors.isStaffLoading);
		} finally {
			this.loaders.isStaffLoading = false;
		}
	}
}

export default StaffStore;
