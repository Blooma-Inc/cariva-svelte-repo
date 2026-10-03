import {
	getPatientRegistrySearch,
	postCheckExisting,
	postLinkPatientToTenant,
	postPatientRegistration
} from '$lib/requests/patient';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import type { PatientRegistrySearch } from '$routes/(protected)/patients/register/components/registry-search.svelte';
import type { PatientBio, PatientReg } from '$routes/(protected)/patients/register/validation';
import { toast } from '@cariva/ui/components/toast/index.js';
import type { RootStore } from '../index.svelte';

const INIT_IS_LOADING = {
	isSearchingPatientRegistry: false,
	isCheckingExisting: false,
	isRegisteringPatient: false,
	isLinking: false
};

class PatientStore {
	rootStore: RootStore;
	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	async searchRegistry(params: PatientRegistrySearch) {
		this.loaders.isSearchingPatientRegistry = true;
		this.errors.isSearchingPatientRegistry = '';
		try {
			const result = await getPatientRegistrySearch(params);
			return result.data.data;
		} catch (error) {
			this.errors.isSearchingPatientRegistry = parseError(error);
		} finally {
			this.loaders.isSearchingPatientRegistry = false;
		}
	}

	async checkExistingPatients(payload: PatientBio) {
		this.loaders.isCheckingExisting = true;
		this.errors.isCheckingExisting = '';
		try {
			const result = await postCheckExisting(payload);
			return result.data.data;
		} catch (error) {
			this.errors.isCheckingExisting = parseError(error);
			toast.error(this.errors.isCheckingExisting);
		} finally {
			this.loaders.isCheckingExisting = false;
		}
	}

	async registerPatient({
		patientReg,
		dismissed_candidate_uids,
		was_ambiguous_check = false,
		cb
	}: {
		patientReg: PatientReg;
		dismissed_candidate_uids: Array<string>;
		was_ambiguous_check: boolean;
		cb?: () => void;
	}) {
		this.loaders.isRegisteringPatient = true;
		this.errors.isRegisteringPatient = '';
		try {
			const result = await postPatientRegistration(
				patientReg,
				dismissed_candidate_uids,
				was_ambiguous_check
			);
			toast.success(result.data.message);
			cb?.();
		} catch (error) {
			this.errors.isRegisteringPatient = parseError(error);
			toast.error(this.errors.isRegisteringPatient);
		} finally {
			this.loaders.isRegisteringPatient = false;
		}
	}

	async linkPatientToTenant(patient_uid: string, cb?: () => void) {
		this.loaders.isLinking = true;
		this.errors.isLinking = '';
		try {
			const result = await postLinkPatientToTenant(patient_uid);
			toast.success(result.data.message);
			cb?.();
		} catch (error) {
			this.errors.isLinking = parseError(error);
			toast.error(this.errors.isLinking);
		} finally {
			this.loaders.isLinking = false;
		}
	}
}

export default PatientStore;
