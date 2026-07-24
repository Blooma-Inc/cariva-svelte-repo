export const load = async ({ params }) => {
	const currentId = params.id;
	return {
		tenant_uid: currentId
	};
};
