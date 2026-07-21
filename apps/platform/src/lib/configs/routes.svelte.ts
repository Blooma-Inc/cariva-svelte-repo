import type { Pathname } from '$app/types';
import { EnumRole } from './roles';

class Route {
	path: Pathname;
	title: string;
	description: string;
	roles: Array<string>;
	isProtected: boolean;

	constructor({
		path,
		title,
		description = '',
		roles = [],
		isProtected
	}: {
		path: Pathname;
		title: string;
		description?: string;
		roles?: Array<string>;
		isProtected: boolean;
	}) {
		this.path = path;
		this.title = title;
		this.description = description;
		this.roles = roles;
		this.isProtected = isProtected;
	}
}

class Routes {
	// auth
	LOGIN = new Route({
		path: '/auth/login',
		title: 'Login',
		description: 'Login page',
		isProtected: false
	});

	// protected
	DASHBOARD = new Route({
		path: '/',
		title: 'Dashboard',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	TENANT = new Route({
		path: '/tenants',
		title: 'Tenants',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	TENANT_DETAILS = new Route({
		path: '/tenants/:uid',
		title: 'New Tenants',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	SYSTEM_SETTINGS = new Route({
		path: '/system-settings',
		title: 'System settings',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	AUDIT_LOGS = new Route({
		path: '/audit-logs',
		title: 'Audit Logs',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	PLATFORM_ANALYTICS = new Route({
		path: '/analytics',
		title: 'Platform Analytics',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});

	NOTIFICATION = new Route({
		path: '/notifications',
		title: 'Notifications',
		description: 'Users Notification',
		isProtected: true
	});
	SETTINGS = new Route({
		path: '/settings',
		title: 'Settings',
		description: 'Users Settings',
		isProtected: true
	});

	allRoutes() {
		return [
			this.LOGIN,
			this.DASHBOARD,
			this.TENANT,
			this.TENANT_DETAILS,
			this.SYSTEM_SETTINGS,
			this.AUDIT_LOGS,
			this.PLATFORM_ANALYTICS,
			this.NOTIFICATION,
			this.SETTINGS
		];
	}

	openRoutes() {
		return this.allRoutes().filter((route) => !route.isProtected);
	}

	protectedRoutes() {
		return this.allRoutes().filter((route) => route.isProtected);
	}
}

const ROUTES = new Routes();

export default ROUTES;
