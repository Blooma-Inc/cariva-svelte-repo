import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { stores } from '$lib/store/index.svelte';
import { canReadPractitionerSchedule } from '$lib/utils/practitioner-availability-access';
import server from '$lib/requests';
import { practitionerAvailability } from './fetch-key-factory';

export function useFetchPractitionerAvailability(
	branchUid: () => string,
	params: PractitionerAvailabilityQueryParams,
	allPages = false
) {
	return createQuery(() => {
		const tenantUid = stores.AppStore.currentTenant.uid ?? '';
		const selectedBranch = branchUid();
		const practitionerUid = params.practitioner_uid;
		const meta = practitionerAvailability.list(tenantUid, selectedBranch, params);
		return {
			queryKey: [...meta.keys(), allPages],
			meta,
			enabled: browser && canReadPractitionerSchedule(stores, selectedBranch, practitionerUid),
			queryFn: async ({ signal }) => {
				let offset = meta.params.offset;
				const records: PractitionerAvailabilityItem[] = [];
				while (true) {
					if (
						signal.aborted ||
						tenantUid !== stores.AppStore.currentTenant.uid ||
						selectedBranch !== branchUid() ||
						practitionerUid !== params.practitioner_uid ||
						!canReadPractitionerSchedule(stores, selectedBranch, practitionerUid)
					)
						throw new Error('You do not have permission to view this schedule.');
					const response = (
						await server.get<CarivaServerResp<PractitionerAvailabilityItem[], OffsetPagination>>(
							meta.path,
							{ signal, params: { ...meta.params, offset } }
						)
					).data;
					if (!allPages) return response;
					records.push(...response.data);
					offset += response.data.length;
					if (!response.data.length || offset >= response.meta.total)
						return { ...response, data: records };
				}
			}
		};
	});
}

export function useFetchPractitionerSchedule(context: PractitionerScheduleContext, uid: string) {
	return createQuery(() => {
		const tenantUid = stores.AppStore.currentTenant.uid ?? '';
		const meta = practitionerAvailability.detail(tenantUid, context.branch_uid, uid);
		return {
			queryKey: [...meta.keys(), context.practitioner_uid],
			meta,
			enabled:
				browser &&
				Boolean(uid) &&
				canReadPractitionerSchedule(stores, context.branch_uid, context.practitioner_uid),
			staleTime: 0,
			refetchOnMount: 'always' as const,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			queryFn: async ({ signal }) => {
				if (
					!uid ||
					tenantUid !== stores.AppStore.currentTenant.uid ||
					!canReadPractitionerSchedule(stores, context.branch_uid, context.practitioner_uid)
				)
					throw new Error('You do not have permission to view this schedule.');
				const record = (
					await server.get<CarivaServerResp<PractitionerAvailabilityItem>>(meta.path, { signal })
				).data.data;
				if (
					record.practitioner_uid !== context.practitioner_uid ||
					record.branch_uid !== context.branch_uid ||
					record.tenant_uid !== tenantUid
				)
					throw new Error('This schedule does not belong to the selected practitioner and branch.');
				return record;
			}
		};
	});
}

export function useFindPractitionerSchedule(
	context: PractitionerScheduleContext,
	offeringUid: () => string | null,
	enabled: () => boolean
) {
	return createQuery(() => {
		const tenantUid = stores.AppStore.currentTenant.uid ?? '';
		const offering = offeringUid();
		const meta = practitionerAvailability.context(
			tenantUid,
			context.branch_uid,
			context.practitioner_uid,
			context.assignment_uid,
			offering
		);
		return {
			queryKey: meta.keys(),
			meta,
			enabled:
				browser &&
				enabled() &&
				offering !== '' &&
				Boolean(context.assignment_uid) &&
				canReadPractitionerSchedule(stores, context.branch_uid, context.practitioner_uid),
			staleTime: 0,
			refetchOnMount: 'always' as const,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			queryFn: async ({ signal }) => {
				let offset = 0;
				while (true) {
					if (
						!enabled() ||
						offering === '' ||
						offering !== offeringUid() ||
						signal.aborted ||
						tenantUid !== stores.AppStore.currentTenant.uid ||
						!canReadPractitionerSchedule(stores, context.branch_uid, context.practitioner_uid)
					)
						throw new Error('You do not have permission to load this schedule context.');
					const params = {
						practitioner_uid: context.practitioner_uid,
						limit: 100,
						offset,
						...(offering === null
							? { general_only: true }
							: { branch_healthcare_service_uid: offering })
					};
					const response = (
						await server.get<CarivaServerResp<PractitionerAvailabilityItem[], OffsetPagination>>(
							meta.path,
							{ signal, params }
						)
					).data;
					const record = response.data.find(
						(item) =>
							item.assignment_uid === context.assignment_uid &&
							item.practitioner_uid === context.practitioner_uid &&
							item.branch_uid === context.branch_uid &&
							item.tenant_uid === tenantUid &&
							item.branch_healthcare_service_uid === offering
					);
					if (record) return record;
					offset += 100;
					if (offset >= response.meta.total || !response.data.length) return null;
				}
			}
		};
	});
}
