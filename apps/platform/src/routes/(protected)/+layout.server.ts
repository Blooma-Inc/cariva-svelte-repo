export const load = async ({ locals }) => ({
	hasValidSession: !!locals.hasValidSession
});
