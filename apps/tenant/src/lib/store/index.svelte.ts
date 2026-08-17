import AppStore from './app/index.svelte';
import AuthStore from './auth/index.svelte';
import BranchStore from './branch/index.svelte';

export class RootStore {
	AppStore: AppStore;
	AuthStore: AuthStore;
	BranchStore: BranchStore;

	constructor() {
		this.AppStore = new AppStore(this);
		this.AuthStore = new AuthStore(this);
		this.BranchStore = new BranchStore(this);
	}
}

export const stores = new RootStore();
