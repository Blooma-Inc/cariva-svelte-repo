import { isAxiosError } from 'axios';
import type { RootStore } from '../index.svelte';
import { canBookAppointments, containsAppointment } from '$lib/utils/appointment-booking';
import { appointmentPayloadSchema } from '$lib/validators/appointments';
import { getAppointmentAvailability, postAppointment } from '$lib/requests/appointments';
import { parseError } from '$lib/utils/errorHandler';
import { toast } from '@cariva/ui/components/toast/index.js';
export default class AppointmentStore {
	loading = $state(false);
	error = $state('');
	slotConflict = $state(false);
	constructor(private root: RootStore) {}
	async create(
		branchUid: string,
		payload: CreateAppointmentPayload
	): Promise<AppointmentItem | null> {
		if (this.loading) return null;
		this.error = '';
		this.slotConflict = false;
		const tenant = this.root.AppStore.currentTenant.uid;
		const allowed = () =>
			tenant === this.root.AppStore.currentTenant.uid && canBookAppointments(this.root, branchUid);
		const parsed = appointmentPayloadSchema.safeParse(payload);
		if (!allowed() || !parsed.success || Date.parse(payload.starts_at) <= Date.now()) {
			this.error =
				'Choose a future time, a patient, and a valid service and practitioner in your assigned branch.';
			return null;
		}
		this.loading = true;
		try {
			const params = {
				patient_uid: parsed.data.patient_uid,
				practitioner_uid: parsed.data.practitioner_uid,
				branch_healthcare_service_uid: parsed.data.branch_healthcare_service_uid,
				starts_at: parsed.data.starts_at,
				ends_at: parsed.data.ends_at
			};
			const availability = (await getAppointmentAvailability(branchUid, params)).data.data;
			if (!allowed()) throw new Error('Your booking session or permissions changed.');
			if (
				availability.practitioner_uid !== payload.practitioner_uid ||
				availability.branch_healthcare_service_uid !== payload.branch_healthcare_service_uid ||
				!containsAppointment(availability.intervals, payload)
			) {
				this.slotConflict = true;
				this.error = 'That time is no longer available. Please choose another time.';
				return null;
			}
			const result = (await postAppointment(branchUid, parsed.data)).data.data;
			if (!allowed() || result.branch_uid !== branchUid || result.tenant_uid !== tenant)
				return null;
			toast.success('Appointment booked.');
			return result;
		} catch (error) {
			this.slotConflict = isAxiosError(error) && error.response?.status === 409;
			this.error = this.slotConflict
				? 'That time could not be booked. Availability has been refreshed; please select a time again.'
				: parseError(error);
			return null;
		} finally {
			this.loading = false;
		}
	}
}
