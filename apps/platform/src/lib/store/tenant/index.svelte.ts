import { PERMISSIONS } from '$lib/configs/permissions';
import { tenantLifecycleActions } from '$lib/utils/tenant-lifecycle';
import { goto } from '$app/navigation';
import ROUTES from '$lib/configs/routes.svelte';
import { postActivateTenant, postTenantRequest, postTenantLifecycle } from '$lib/requests/tenant';
import { parseError } from '$lib/utils/errorHandler';
import initializer from '$lib/utils/initializers';
import type { TProvisionTenantSchema } from '$routes/(protected)/tenants/modals/tenant-form-modal.svelte';
import type { RootStore } from '../index.svelte';
import { toast } from '@cariva/ui/components/toast/index.js';

const INIT_IS_LOADING = {
	isTenantRequest: false,
	isTenantLifecycle: false
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
			goto(ROUTES.TENANT.resolve(), { replaceState: true });
			cb?.();
		} catch (error) {
			toast.error(parseError(error));
		} finally {
			this.loaders.isTenantRequest = false;
		}
	}

	async editTenantRequest(
		tenant_uid: string,
		payload: Partial<TProvisionTenantSchema>,
		cb?: () => void
	) {
		this.loaders.isTenantRequest = true;
		this.errors.isTenantRequest = '';

		try {
			// const {
			// 	data: { message }
			// } = await postTenantRequest(payload);

			// toast.success(message);
			goto(ROUTES.TENANT.resolve(), { replaceState: true });
			cb?.();
		} catch (error) {
			toast.error(parseError(error));
		} finally {
			this.loaders.isTenantRequest = false;
		}
	}

	async changeTenantStatus(
		tenant_uid: string,
		status: string,
		action: TenantLifecycleAction,
		reason: string,
		cb?: () => void
	) {
		if (this.loaders.isTenantLifecycle) return;
		this.errors.isTenantLifecycle = '';
		if (
			!this.rootStore.PermissionStore.canAll([PERMISSIONS.TENANTS_READ, PERMISSIONS.TENANTS_MANAGE])
		) {
			this.errors.isTenantLifecycle = 'You do not have permission to manage tenants.';
			return;
		}
		if (!tenantLifecycleActions(status).includes(action)) {
			this.errors.isTenantLifecycle =
				'This action is not available for the tenant’s current status.';
			return;
		}
		if (action !== 'activate' && !reason.trim()) {
			this.errors.isTenantLifecycle = 'Enter a reason.';
			return;
		}
		this.loaders.isTenantLifecycle = true;
		try {
			const { data } = await postTenantLifecycle(action, tenant_uid, reason.trim());
			toast.success(data.message);
			cb?.();
		} catch (error) {
			this.errors.isTenantLifecycle = parseError(error);
		} finally {
			this.loaders.isTenantLifecycle = false;
		}
	}

	async activateTenant(tenant_uid: string, cb?: () => void) {
		if (!this.rootStore.PermissionStore.can(PERMISSIONS.TENANTS_MANAGE)) return;
		this.loaders.isTenantRequest = true;
		this.errors.isTenantRequest = '';

		try {
			const {
				data: { message }
			} = await postActivateTenant(tenant_uid);

			toast.success(message);
			cb?.();
		} catch (error) {
			toast.error(parseError(error));
		} finally {
			this.loaders.isTenantRequest = false;
		}
	}
}

export default TenantStore;
