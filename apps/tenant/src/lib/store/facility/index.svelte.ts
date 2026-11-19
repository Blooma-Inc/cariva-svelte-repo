import { patchWard, postWard } from '$lib/requests/facility';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import { toast } from '@cariva/ui/components/toast/index.js';
import type { RootStore } from '../index.svelte';

const INIT_IS_LOADING = {
	isWardLoading: false
};

class FacilityStore {
	rootStore: RootStore;
	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	async createWard(branch_uid: string, payload: CreateWardPayload, cb?: () => void) {
		if (this.loaders.isWardLoading) return;
		this.loaders.isWardLoading = true;
		this.errors.isWardLoading = '';
		try {
			const res = await postWard(branch_uid, payload);
			toast.success(res.data.message);
			cb?.();
		} catch (error) {
			this.errors.isWardLoading = parseError(error);
		} finally {
			this.loaders.isWardLoading = false;
		}
	}

	async editWard(
		branch_uid: string,
		ward_uid: string,
		payload: UpdateWardPayload,
		cb?: () => void
	) {
		if (this.loaders.isWardLoading) return;
		this.loaders.isWardLoading = true;
		this.errors.isWardLoading = '';
		try {
			const res = await patchWard(branch_uid, ward_uid, payload);
			toast.success(res.data.message);
			cb?.();
		} catch (error) {
			this.errors.isWardLoading = parseError(error);
		} finally {
			this.loaders.isWardLoading = false;
		}
	}
}

export default FacilityStore;
