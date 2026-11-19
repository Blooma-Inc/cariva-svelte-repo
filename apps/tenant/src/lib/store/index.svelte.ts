import AppStore from './app/index.svelte';
import AuthStore from './auth/index.svelte';
import BranchStore from './branch/index.svelte';
import EncounterStore from './encounter/index.svelte';
import FacilityStore from './facility/index.svelte';
import PatientStore from './patient/index.svelte';
import PermissionStore from './permissions/index.svelte';
import StaffStore from './staff/index.svelte';

export class RootStore {
	AppStore: AppStore;
	AuthStore: AuthStore;
	BranchStore: BranchStore;
	EncounterStore: EncounterStore;
	FacilityStore: FacilityStore;
	StaffStore: StaffStore;
	PatientStore: PatientStore;
	PermissionStore: PermissionStore;

	constructor() {
		this.AppStore = new AppStore(this);
		this.AuthStore = new AuthStore(this);
		this.BranchStore = new BranchStore(this);
		this.EncounterStore = new EncounterStore(this);
		this.FacilityStore = new FacilityStore(this);
		this.StaffStore = new StaffStore(this);
		this.PatientStore = new PatientStore(this);
		this.PermissionStore = new PermissionStore(this);
	}
}

export const stores = new RootStore();
