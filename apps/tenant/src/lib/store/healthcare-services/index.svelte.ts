import type { RootStore } from '../index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import { postHealthcareService, patchHealthcareService } from '$lib/requests/healthcare-services';
import { parseError } from '$lib/utils/errorHandler';
import { toast } from '@cariva/ui/components/toast/index.js';

export default class HealthcareServiceStore {
	loading = $state(false);
	error = $state('');
	constructor(private rootStore: RootStore) {}
	async save(
		uid: string,
		payload: CreateHealthcareServicePayload | UpdateHealthcareServicePayload,
		cb?: () => void
	) {
		if (this.loading) return;
		this.error = '';
		const permissions = this.rootStore.PermissionStore;
		if (
			!this.rootStore.AppStore.currentTenant.uid ||
			!permissions.can(PERMISSIONS.HEALTHCARE_SERVICES_READ) ||
			!permissions.can(
				uid ? PERMISSIONS.HEALTHCARE_SERVICES_UPDATE : PERMISSIONS.HEALTHCARE_SERVICES_CREATE
			)
		) {
			this.error = 'You do not have permission to save healthcare services.';
			return;
		}
		if (
			(!uid && !payload.name?.trim()) ||
			(payload.name !== undefined && (!payload.name.trim() || payload.name.trim().length > 255)) ||
			(uid && !Object.keys(payload).length)
		) {
			this.error = 'Enter a service name of up to 255 characters and make a change before saving.';
			return;
		}
		this.loading = true;
		try {
			const normalized = {
				...payload,
				...(payload.name !== undefined ? { name: payload.name.trim() } : {})
			};
			const response = uid
				? await patchHealthcareService(uid, normalized)
				: await postHealthcareService(normalized as CreateHealthcareServicePayload);
			toast.success(response.data.message);
			cb?.();
		} catch (error) {
			this.error = parseError(error);
		} finally {
			this.loading = false;
		}
	}
}
