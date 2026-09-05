import { resolve } from '$app/paths';
import type { RouteId, RouteParams } from '$app/types';
import { EnumRole } from './roles';

class Route<T extends RouteId = RouteId> {
	path: T;
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
		path: T;
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

	resolve(...params: RouteParams<T> extends Record<string, never> ? [] : [params: RouteParams<T>]) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (resolve as any)(this.path, ...params);
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
		path: '/(protected)/tenants',
		title: 'Tenants',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	TENANT_DETAILS = new Route({
		path: '/(protected)/tenants/[id]',
		title: 'New Tenants',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	SYSTEM_SETTINGS = new Route({
		path: '/(protected)/system-settings',
		title: 'System settings',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	AUDIT_LOGS = new Route({
		path: '/(protected)/audit-logs',
		title: 'Audit Logs',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});
	PLATFORM_ANALYTICS = new Route({
		path: '/(protected)/analytics',
		title: 'Platform Analytics',
		isProtected: true,
		roles: [EnumRole.PLATFORM_SUPER_ADMIN]
	});

	NOTIFICATION = new Route({
		path: '/(protected)/notifications',
		title: 'Notifications',
		description: 'Users Notification',
		isProtected: true
	});
	PROFILE = new Route({
		path: '/(protected)/profile',
		title: 'Profile',
		description: 'User Profile',
		isProtected: true
	});
	SETTINGS = new Route({
		path: '/(protected)/settings',
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
			this.PROFILE,
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
