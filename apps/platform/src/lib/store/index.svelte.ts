import PermissionStore from './permissions/index.svelte';
import AppStore from './app/index.svelte';
import AuthStore from './auth/index.svelte';
import TenantStore from './tenant/index.svelte';

export class RootStore {
	AppStore: AppStore;
	AuthStore: AuthStore;
	TenantStore: TenantStore;
	PermissionStore: PermissionStore;

	constructor() {
		this.PermissionStore = new PermissionStore(this);
		this.AppStore = new AppStore(this);
		this.AuthStore = new AuthStore(this);
		this.TenantStore = new TenantStore(this);
	}
}

export const stores = new RootStore();
