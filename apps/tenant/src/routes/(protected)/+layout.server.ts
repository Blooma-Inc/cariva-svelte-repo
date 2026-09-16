export const load = async ({ locals, route }) => ({
	hasValidSession: !!locals.hasValidSession,
	routeId: route.id
});
