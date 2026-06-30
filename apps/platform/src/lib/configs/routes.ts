class Route {
	path: string;

	title: string;

	description: string;

	constructor(path: string, title: string, description: string) {
		this.path = path;
		this.title = title;
		this.description = description;
	}
}

class Routes {
	// auth
	LOGIN = new Route('/auth/login', 'Login', 'Login page');

	// protected
	DASHBOARD = new Route('/', 'Dashboard', '');
	TENANT = new Route('/tenants', 'Tenants', '');
	SYSTEM_SETTINGS = new Route('/system-settings', 'System settings', '');
	AUDIT_LOGS = new Route('/audit-logs', 'Audit Logs', '');
	PLATFORM_ANALYTICS = new Route('/analytics', 'Platform Analytics', '');

	NOTIFICATION = new Route('/notifications', 'Notifications', 'Users Notification');
	SETTINGS = new Route('/settings', 'Settings', 'Users Settings');
}

const ROUTES = new Routes();

export default ROUTES;
