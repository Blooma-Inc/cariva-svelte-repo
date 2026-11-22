import { SvelteSet } from 'svelte/reactivity';
import type { RootStore } from '../index.svelte';

class PermissionStore {
	rootStore: RootStore;
	readonly permissions = new SvelteSet<string>();

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	clear() {
		this.permissions.clear();
	}

	setPermissions(permissions: string[]) {
		this.permissions.clear();
		for (const permission of permissions) {
			this.permissions.add(permission);
		}
	}

	can(permission: string) {
		return this.permissions.has(permission);
	}

	canAny(permissions: string[]) {
		return permissions.some((permission) => this.can(permission));
	}

	canAll(permissions: string[]) {
		return permissions.every((permission) => this.can(permission));
	}
}

export default PermissionStore;
