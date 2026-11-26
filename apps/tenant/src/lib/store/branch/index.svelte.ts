import { patchBranch, postBranch } from '$lib/requests/branch';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import type { TCreateBranchSchema } from '$routes/(protected)/branches/modals/branch-form-modal.svelte';
import { toast } from '@cariva/ui/components/toast/index.js';
import type { RootStore } from '../index.svelte';

const INIT_IS_LOADING = {
	isBranchLoading: false
};

class BranchStore {
	rootStore: RootStore;

	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(_rootStore: RootStore) {
		this.rootStore = _rootStore;
	}

	async createBranch(payload: TCreateBranchSchema, cb?: () => void) {
		this.loaders.isBranchLoading = false;
		this.errors.isBranchLoading = '';
		try {
			const res = await postBranch(payload);
			toast.success(res.data.message);

			cb?.();
		} catch (error) {
			this.errors.isBranchLoading = parseError(error);
			toast.error(this.errors.isBranchLoading);
		} finally {
			this.loaders.isBranchLoading = false;
		}
	}

	async editBranch(branch_uid: string, payload: Partial<BranchDetailedItem>, cb?: () => void) {
		this.loaders.isBranchLoading = true;
		this.errors.isBranchLoading = '';
		try {
			const res = await patchBranch(branch_uid, payload);
			toast.success(res.data.message);

			cb?.();
		} catch (error) {
			this.errors.isBranchLoading = parseError(error);
		} finally {
			this.loaders.isBranchLoading = false;
		}
	}
}

export default BranchStore;
