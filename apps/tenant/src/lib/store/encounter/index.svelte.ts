import { postEncounter } from '$lib/requests/encounter';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import { toast } from '@cariva/ui/components/toast/index.js';
import type { RootStore } from '../index.svelte';

const INIT_IS_LOADING = {
	isEncounterLoading: false
};

class EncounterStore {
	rootStore: RootStore;
	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	async createEncounter(branch_uid: string, payload: CreateEncounterPayload, cb?: () => void) {
		if (this.loaders.isEncounterLoading) return;
		this.loaders.isEncounterLoading = true;
		this.errors.isEncounterLoading = '';
		try {
			const res = await postEncounter(branch_uid, payload);
			toast.success(`Encounter ${res.data.data.encounter_no} created.`);
			cb?.();
		} catch (error) {
			this.errors.isEncounterLoading = parseError(error);
		} finally {
			this.loaders.isEncounterLoading = false;
		}
	}
}

export default EncounterStore;
