import type { RootStore } from '../index.svelte';
import {
	canActivatePractitionerSchedule,
	canReadPractitionerSchedule,
	canWritePractitionerSchedule
} from '$lib/utils/practitioner-availability-access';
import {
	practitionerScheduleCreateSchema,
	practitionerScheduleUpdateSchema
} from '$lib/validators/practitioner-availability';
import {
	postPractitionerAvailability,
	patchPractitionerAvailability
} from '$lib/requests/practitioner-availability';
import { parseError } from '$lib/utils/errorHandler';
import { toast } from '@cariva/ui/components/toast/index.js';

export default class PractitionerAvailabilityStore {
	loading = $state(false);
	error = $state('');
	constructor(private root: RootStore) {}
	async save(
		context: PractitionerScheduleContext,
		payload: BranchHealthcareServicePayload | CreatePractitionerAvailabilityPayload,
		record?: PractitionerAvailabilityItem,
		onSuccess?: () => void
	) {
		if (this.loading) return;
		this.error = '';
		const create = !record;
		if (
			!canWritePractitionerSchedule(this.root, context.branch_uid, context.practitioner_uid, create)
		) {
			this.error = 'You do not have permission to change this practitioner’s schedule.';
			return;
		}
		const tenantUid = this.root.AppStore.currentTenant.uid;
		if (
			record &&
			(!record.uid ||
				record.tenant_uid !== tenantUid ||
				record.practitioner_uid !== context.practitioner_uid ||
				record.branch_uid !== context.branch_uid)
		) {
			this.error = 'The schedule does not match the selected practitioner and branch.';
			return;
		}
		if (
			create &&
			(!context.practitioner_is_active || !context.assignment_is_active || !context.assignment_uid)
		) {
			this.error = 'The practitioner must be active and assigned to this branch.';
			return;
		}
		const result = create
			? practitionerScheduleCreateSchema.safeParse(payload)
			: practitionerScheduleUpdateSchema.safeParse(payload);
		if (
			!result.success ||
			(create &&
				(payload as CreatePractitionerAvailabilityPayload).practitioner_uid !==
					context.practitioner_uid)
		) {
			this.error =
				'Provide a valid schedule. Practitioner, branch assignment, and service context cannot be changed on an existing schedule.';
			return;
		}
		if (record && payload.is_active === true && !canActivatePractitionerSchedule(record)) {
			this.error =
				'The practitioner, branch assignment, branch, and service must be active before enabling this schedule.';
			return;
		}
		this.loading = true;
		try {
			const response = create
				? await postPractitionerAvailability(
						context.branch_uid,
						payload as CreatePractitionerAvailabilityPayload
					)
				: await patchPractitionerAvailability(context.branch_uid, record!.uid, payload);
			if (
				tenantUid === this.root.AppStore.currentTenant.uid &&
				canReadPractitionerSchedule(this.root, context.branch_uid, context.practitioner_uid)
			) {
				toast.success(response.data.message);
				onSuccess?.();
			}
		} catch (error) {
			this.error = parseError(error);
		} finally {
			this.loading = false;
		}
	}
}
