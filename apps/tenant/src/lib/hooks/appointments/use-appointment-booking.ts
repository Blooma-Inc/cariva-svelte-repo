import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { stores } from '$lib/store/index.svelte';
import server from '$lib/requests';
import { canBookAppointments, canReadAppointments } from '$lib/utils/appointment-booking';
import { appointments } from './fetch-key-factory';

type OptionTypes = {
	services: BranchHealthcareServiceItem;
	practitioners: PractitionerAvailabilityItem;
	patients: LinkedTenantPatientItem;
};
export function useBookingOptions<K extends keyof OptionTypes>(
	branch: () => string,
	kind: K,
	search: () => string = () => ''
) {
	return createQuery(() => {
		const tenant = stores.AppStore.currentTenant.uid ?? '';
		const branchUid = branch();
		const meta = appointments.options(tenant, branchUid, kind, search());
		const allowed = () =>
			tenant === stores.AppStore.currentTenant.uid &&
			branchUid === branch() &&
			canBookAppointments(stores, branchUid);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && allowed(),
			staleTime: 0,
			queryFn: async ({ signal }) => {
				const rows: OptionTypes[K][] = [];
				let offset = 0;
				while (true) {
					if (!allowed() || signal.aborted)
						throw new Error('Your booking session or permissions changed.');
					const response = (
						await server.get<CarivaServerResp<OptionTypes[K][], OffsetPagination>>(meta.path, {
							signal,
							params: { ...meta.params, offset }
						})
					).data;
					rows.push(...response.data);
					offset += response.data.length;
					if (
						kind === 'patients' ||
						!response.data.length ||
						offset >= (response.meta?.total ?? offset)
					)
						return rows;
				}
			}
		};
	});
}
export function useAppointmentAvailability(
	branch: () => string,
	params: () => AppointmentAvailabilityParams | null
) {
	return createQuery(() => {
		const tenant = stores.AppStore.currentTenant.uid ?? '';
		const branchUid = branch();
		const meta = appointments.availability(tenant, branchUid, params());
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && !!meta.params && canReadAppointments(stores, branchUid),
			staleTime: 0,
			retry: false,
			queryFn: async ({ signal }) => {
				if (
					!meta.params ||
					tenant !== stores.AppStore.currentTenant.uid ||
					!canReadAppointments(stores, branchUid)
				)
					throw new Error('Your booking session or permissions changed.');
				const result = (
					await server.get<CarivaServerResp<AppointmentAvailability>>(meta.path, {
						params: meta.params,
						signal
					})
				).data.data;
				if (
					result.practitioner_uid !== meta.params.practitioner_uid ||
					result.branch_healthcare_service_uid !== meta.params.branch_healthcare_service_uid
				)
					throw new Error('Availability does not match the selected service and practitioner.');
				return result;
			}
		};
	});
}

export function useAppointmentBookingContext(branch: () => string) {
	return createQuery(() => {
		const tenant = stores.AppStore.currentTenant.uid ?? '';
		const branchUid = branch();
		const meta = appointments.bookingContext(tenant, branchUid);
		const allowed = () =>
			tenant === stores.AppStore.currentTenant.uid &&
			branchUid === branch() &&
			canReadAppointments(stores, branchUid);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && allowed(),
			staleTime: 0,
			retry: false,
			queryFn: async ({ signal }) => {
				if (!allowed()) throw new Error('Your booking session or permissions changed.');
				const context = (
					await server.get<CarivaServerResp<AppointmentBookingContext>>(meta.path, { signal })
				).data.data;
				if (!allowed()) throw new Error('Your booking session or permissions changed.');
				if (context.branch.uid !== branchUid || !('operating_hours' in context.branch))
					throw new Error('Booking context does not match the selected branch or is incomplete.');
				return context;
			}
		};
	});
}
