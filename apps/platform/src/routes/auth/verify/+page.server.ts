import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		error(400, {
			message: 'Missing required query parameter: "token" is compulsory.'
		});
	}
	return {
		token
	};
};
