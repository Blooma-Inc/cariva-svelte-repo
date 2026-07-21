import { createQuery } from '@tanstack/svelte-query';
import { tenant } from './fetch-key-factory';

export function useFetchTenantSuggestedCode(
	getHospitalName: () => string = () => '',
	getCity: () => string = () => '',
	getEnable: () => boolean = () => true
): QueryHookResponse<string | undefined> {
	const query = createQuery(() => {
		const hospital_name = getHospitalName();
		const city = getCity();
		const enable = getEnable();
		const meta = tenant.getTenantSuggestedCode(hospital_name, city);

		return {
			queryKey: meta.keys(),
			meta,
			enabled: !!hospital_name && !!city && enable,
			select: (resp: CarivaServerResp<string>) => resp.data
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
