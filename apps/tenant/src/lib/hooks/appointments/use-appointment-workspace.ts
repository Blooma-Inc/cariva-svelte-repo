import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { stores } from '$lib/store/index.svelte';
import server from '$lib/requests';
import { canReadAppointments } from '$lib/utils/appointment-booking';
import { appointmentViewer } from '$lib/utils/appointment-workspace';
import { appointments } from './fetch-key-factory';
type QueryMeta = { path: string; params?: object; keys: () => readonly unknown[] };
function useWorkspaceRead<T>(
	branch: () => string,
	metaFor: (tenant: string, branch: string) => QueryMeta,
	enabled: () => boolean,
	validate: (response: T, tenant: string, branch: string) => boolean
) {
	return createQuery(() => {
		const tenant = stores.AppStore.currentTenant.uid ?? '';
		const branchUid = branch();
		const viewer = appointmentViewer(stores);
		const meta = metaFor(tenant, branchUid);
		const allowed = () =>
			enabled() &&
			tenant === stores.AppStore.currentTenant.uid &&
			branchUid === branch() &&
			JSON.stringify(viewer) === JSON.stringify(appointmentViewer(stores)) &&
			canReadAppointments(stores, branchUid);
		return {
			queryKey: [...meta.keys(), viewer],
			meta,
			enabled: browser && allowed(),
			staleTime: 0,
			retry: false,
			queryFn: async ({ signal }) => {
				if (!allowed()) throw new Error('Your appointment access or branch session changed.');
				const response = (await server.get<T>(meta.path, { params: meta.params, signal })).data;
				if (!allowed() || !validate(response, tenant, branchUid))
					throw new Error('Appointment data does not match this branch session.');
				return response;
			}
		};
	});
}
export function useAppointmentList(
	branch: () => string,
	params: () => AppointmentListParams,
	enabled: () => boolean
) {
	return useWorkspaceRead<CarivaServerResp<AppointmentListItem[], OffsetPagination>>(
		branch,
		(tenant, branchUid) => appointments.list(tenant, branchUid, params()),
		enabled,
		(response, tenant, branchUid) =>
			response.data.every((row) => row.tenant_uid === tenant && row.branch_uid === branchUid)
	);
}
export function useAppointmentDetail(branch: () => string, uid: () => string) {
	return useWorkspaceRead<CarivaServerResp<AppointmentDetailItem>>(
		branch,
		(tenant, branchUid) => appointments.detail(tenant, branchUid, uid()),
		() => !!uid(),
		(response, tenant, branchUid) =>
			response.data.uid === uid() &&
			response.data.tenant_uid === tenant &&
			response.data.branch_uid === branchUid
	);
}
export function useAppointmentSummary(
	branch: () => string,
	params: () => AppointmentSummaryParams,
	enabled: () => boolean
) {
	return useWorkspaceRead<CarivaServerResp<AppointmentDailySummary>>(
		branch,
		(tenant, branchUid) => appointments.summary(tenant, branchUid, params()),
		enabled,
		(response) => response.data.branch_uid === branch() && response.data.date === params().date
	);
}

export function useAppointmentWeek(
	branch: () => string,
	params: () => AppointmentWeekParams,
	enabled: () => boolean
) {
	return createQuery(() => {
		const tenant = stores.AppStore.currentTenant.uid ?? '';
		const branchUid = branch();
		const viewer = JSON.stringify(appointmentViewer(stores));
		const meta = appointments.week(tenant, branchUid, params());
		const allowed = () =>
			enabled() &&
			tenant === stores.AppStore.currentTenant.uid &&
			branchUid === branch() &&
			viewer === JSON.stringify(appointmentViewer(stores)) &&
			canReadAppointments(stores, branchUid);
		return {
			queryKey: [...meta.keys(), viewer],
			meta,
			enabled: browser && allowed(),
			staleTime: 0,
			retry: false,
			queryFn: async ({ signal }) => {
				const records: AppointmentListItem[] = [];
				const seen = new Set<string>();
				let total: number | undefined;
				while (true) {
					if (!allowed() || signal.aborted)
						throw new Error('Your appointment access or branch session changed.');
					const response = (
						await server.get<CarivaServerResp<AppointmentListItem[], OffsetPagination>>(meta.path, {
							signal,
							params: { ...meta.params, limit: 100, offset: records.length }
						})
					).data;
					if (
						!allowed() ||
						response.data.some(
							(record) => record.tenant_uid !== tenant || record.branch_uid !== branchUid
						)
					)
						throw new Error('Appointment data does not match this branch session.');
					if (
						(total !== undefined && total !== response.meta.total) ||
						(!response.data.length && records.length < response.meta.total) ||
						response.data.some((record) => seen.has(record.uid))
					)
						throw new Error('Appointments changed while the week was loading. Please try again.');
					total = response.meta.total;
					for (const record of response.data) {
						if (seen.has(record.uid))
							throw new Error('Appointments changed while the week was loading. Please try again.');
						seen.add(record.uid);
						records.push(record);
					}
					if (records.length >= total) return records;
				}
			}
		};
	});
}
