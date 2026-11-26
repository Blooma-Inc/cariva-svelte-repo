import type { RootStore } from '../index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import { canAccessBranchServices } from '$lib/utils/branch-service-access';
import { serviceAvailabilitySchema } from '$lib/validators/service-availability';
import {
	postBranchHealthcareService,
	patchBranchHealthcareService
} from '$lib/requests/branch-healthcare-services';
import { parseError } from '$lib/utils/errorHandler';
import { toast } from '@cariva/ui/components/toast/index.js';

export default class BranchHealthcareServiceStore {
	loading = $state(false);
	error = $state('');
	constructor(private rootStore: RootStore) {}
	async save(
		branchUid: string,
		serviceUid: string,
		create: boolean,
		payload: BranchHealthcareServicePayload,
		cb?: () => void
	) {
		if (this.loading) return;
		this.error = '';
		const permission = create
			? PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_CREATE
			: PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_UPDATE;
		if (
			!canAccessBranchServices(this.rootStore, branchUid) ||
			!canAccessBranchServices(this.rootStore, branchUid, permission) ||
			(create && !this.rootStore.PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ))
		) {
			this.error = 'You do not have permission to save services for this branch.';
			return;
		}
		if (
			!serviceUid ||
			(!create && !Object.keys(payload).length) ||
			(payload.is_active !== undefined && typeof payload.is_active !== 'boolean') ||
			(payload.availability !== undefined &&
				payload.availability !== null &&
				!serviceAvailabilitySchema.safeParse(payload.availability).success)
		) {
			this.error = 'Select a service and provide valid changes and availability.';
			return;
		}
		const tenantUid = this.rootStore.AppStore.currentTenant.uid;
		this.loading = true;
		try {
			const response = create
				? await postBranchHealthcareService(branchUid, serviceUid, payload)
				: await patchBranchHealthcareService(branchUid, serviceUid, payload);
			if (
				tenantUid === this.rootStore.AppStore.currentTenant.uid &&
				canAccessBranchServices(this.rootStore, branchUid)
			) {
				toast.success(response.data.message);
				cb?.();
			}
		} catch (error) {
			this.error = parseError(error);
		} finally {
			this.loading = false;
		}
	}
}
