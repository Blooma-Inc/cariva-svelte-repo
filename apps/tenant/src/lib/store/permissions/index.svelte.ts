import { getMyPermissions, postOverrideUserPermissions } from '$lib/requests/permissions';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import { SvelteSet } from 'svelte/reactivity';
import type { RootStore } from '../index.svelte';

const INIT_IS_LOADING = {
	isPermissionLoading: false,
	isOverridingUserPermissions: false
};

class PermissionStore {
	rootStore: RootStore;

	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));
	permissions = new SvelteSet<string>();
	role = new SvelteSet<string>();

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	async load() {
		this.loaders.isPermissionLoading = false;
		this.errors.isPermissionLoading = '';
		try {
			const res = await getMyPermissions();
			this.permissions = new SvelteSet(res.data.data);
		} catch (error) {
			this.errors.isPermissionLoading = parseError(error);
		} finally {
			this.loaders.isPermissionLoading = false;
		}
	}

	clear() {
		this.permissions = new SvelteSet();
		this.role = new SvelteSet();
	}

	setPermissions(permissions: Array<string>) {
		this.permissions = new SvelteSet(permissions);
	}

	can(permission: string) {
		return this.permissions.has(permission);
	}
	canAny(perms: string[]) {
		return perms.some((p) => this.permissions.has(p));
	}
	canAll(perms: string[]) {
		return perms.every((p) => this.permissions.has(p));
	}

	async overrideUserPermissions(payload: UserPermissionsOverridePayload, cb?: () => void) {
		this.loaders.isOverridingUserPermissions = false;
		this.errors.isOverridingUserPermissions = '';
		try {
			await postOverrideUserPermissions(payload);
			cb?.();
		} catch (error) {
			this.errors.isOverridingUserPermissions = parseError(error);
		} finally {
			this.loaders.isOverridingUserPermissions = false;
		}
	}
}

export default PermissionStore;
