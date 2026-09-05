import { createQuery } from '@tanstack/svelte-query';
import { staff } from './fetch-key-factory';

export function useFetchStaff(
	staff_uid: string,
	enabled: boolean = true
): QueryHookResponse<CarivaServerResp<StaffItem, null> | undefined> {
	const meta = staff.getStaff(staff_uid);

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<StaffItem, null>) => resp
	}));

	return {
		get data() {
			return query.data;
		},
		get isLoading() {
			return query.isLoading;
		},
		get error() {
			return query.error;
		},
		get status() {
			return query.status;
		},
		refetch: query.refetch
	};
}
