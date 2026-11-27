import { createQuery } from '@tanstack/svelte-query';
import { staff } from './fetch-key-factory';

export function useFetchStaff(
	staff_uid: () => string,
	enabled: boolean = true
): QueryHookResponse<UserProfileItem | undefined> {
	const query = createQuery(() => {
		const meta = staff.getStaff(staff_uid());
		return {
			queryKey: meta.keys(),
			meta,
			enabled,
			select: (resp: CarivaServerResp<UserProfileItem, null>) => resp.data
		};
	});

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
