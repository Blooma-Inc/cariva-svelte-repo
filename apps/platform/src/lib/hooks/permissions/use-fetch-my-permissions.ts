import { createQuery } from '@tanstack/svelte-query';
import { permissions } from './fetch-key-factory';

export function useFetchMyPermissions(userUid: () => string, enabled: () => boolean) {
	return createQuery(() => {
		const meta = permissions.getMyPermissions(userUid());
		return {
			queryKey: meta.keys(),
			meta,
			enabled: enabled(),
			staleTime: 0,
			gcTime: 0,
			select: (response: CarivaServerResp<string[]>) => response.data
		};
	});
}
