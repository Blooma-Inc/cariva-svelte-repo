import { resolve } from '$app/paths';
import type { RouteId, RouteParams } from '$app/types';
import { PERMISSIONS } from './permissions';

class Route<T extends RouteId = RouteId> {
	path: T;
	title: string;
	description: string;
	requiredPermission?: string;
	isProtected: boolean;

	constructor({
		path,
		title,
		description = '',
		requiredPermission,
		isProtected
	}: {
		path: T;
		title: string;
		description?: string;
		requiredPermission?: string;
		isProtected: boolean;
	}) {
		this.path = path;
		this.title = title;
		this.description = description;
		this.requiredPermission = requiredPermission;
		this.isProtected = isProtected;
	}

	resolve(...params: RouteParams<T> extends Record<string, never> ? [] : [params: RouteParams<T>]) {
		const resolveRoute = resolve as unknown as (
			path: T,
			...args: typeof params
		) => ReturnType<typeof resolve>;
		return resolveRoute(this.path, ...params);
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

	RESET_PWD = new Route({
		path: '/auth/reset-password/[token]',
		title: 'Password Reset',
		isProtected: false
	});
	VERIFY = new Route({
		path: '/auth/verify',
		title: 'Email Verification',
		isProtected: false
	});

	// protected
	DASHBOARD = new Route({
		path: '/',
		title: 'Dashboard',
		isProtected: true,
		requiredPermission: PERMISSIONS.PLATFORM_READ
	});
	TENANT = new Route({
		path: '/(protected)/tenants',
		title: 'Tenants',
		isProtected: true,
		requiredPermission: PERMISSIONS.TENANTS_READ
	});
	TENANT_DETAILS = new Route({
		path: '/(protected)/tenants/[id]',
		title: 'New Tenants',
		isProtected: true,
		requiredPermission: PERMISSIONS.TENANTS_READ
	});
	SYSTEM_SETTINGS = new Route({
		path: '/(protected)/system-settings',
		title: 'System settings',
		isProtected: true,
		requiredPermission: PERMISSIONS.PLATFORM_MANAGE
	});
	AUDIT_LOGS = new Route({
		path: '/(protected)/audit-logs',
		title: 'Audit Logs',
		isProtected: true,
		requiredPermission: PERMISSIONS.PLATFORM_READ
	});
	PLATFORM_ANALYTICS = new Route({
		path: '/(protected)/analytics',
		title: 'Platform Analytics',
		isProtected: true,
		requiredPermission: PERMISSIONS.PLATFORM_READ
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
			this.RESET_PWD,
			this.VERIFY,
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

export function getRoute(routeId: string | null) {
	if (routeId === '/(protected)') return ROUTES.DASHBOARD;
	return ROUTES.allRoutes().find((route) => route.path === routeId);
}

export default ROUTES;
