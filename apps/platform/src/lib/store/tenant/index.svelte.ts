import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import ROUTES from '$lib/configs/routes.svelte';
import { postTenantRequest } from '$lib/requests/tenant';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import type { TProvisionTenantSchema } from '$routes/(protected)/tenants/new/validation';
import type { RootStore } from '../index.svelte';
import { toast } from '@cariva/ui/components/toast/index.js';

const INIT_IS_LOADING = {
	isTenantRequest: false
};

class TenantStore {
	rootStore: RootStore;

	loaders = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.loaders, ''));

	constructor(_rootStore: RootStore) {
		this.rootStore = _rootStore;
	}

	async submitTenantRequest(payload: TProvisionTenantSchema, cb?: () => void) {
		this.loaders.isTenantRequest = true;
		this.errors.isTenantRequest = '';
		try {
			const {
				data: { message }
			} = await postTenantRequest(payload);

			toast.success(message);
			goto(resolve(ROUTES.TENANT.path), { replaceState: true });
			cb?.();
		} catch (error) {
			toast.error(parseError(error));
		} finally {
			this.loaders.isTenantRequest = false;
		}
	}
}

export default TenantStore;
