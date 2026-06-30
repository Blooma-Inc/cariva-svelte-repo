import type { RouteId } from '$app/types';
import { resolve } from '$app/paths';

class Route {
	id: RouteId;
	href: string;
	title: string;
	description: string;

	constructor(id: RouteId, title: string, description: string = '') {
		this.id = id;
		this.href = resolve(id);
		this.title = title;
		this.description = description;
	}
}

class Routes {
	LOGIN = new Route('/auth/login', 'Login', 'Login page');
	DASHBOARD = new Route('/(protected)', 'Dashboard');
	TENANT = new Route('/(protected)/tenants', 'Tenants');
	SYSTEM_SETTINGS = new Route('/(protected)/system-settings', 'System settings');
	AUDIT_LOGS = new Route('/(protected)/audit-logs', 'Audit Logs');
	PLATFORM_ANALYTICS = new Route('/(protected)/analytics', 'Platform Analytics');
	NOTIFICATION = new Route('/(protected)/notifications', 'Notifications', 'Users Notification');
	SETTINGS = new Route('/(protected)/settings', 'Settings', 'Users Settings');
}

const ROUTES = new Routes();
export default ROUTES;
