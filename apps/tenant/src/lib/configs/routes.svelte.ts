import { resolve } from '$app/paths';
import type { RouteId, RouteParams } from '$app/types';
import { PERMISSIONS } from '$lib/configs/permissions';

export class Route<T extends RouteId = RouteId> {
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (resolve as any)(this.path, ...params);
	}
}

// export const { Route };

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
		description: '',
		isProtected: false
	});
	VERIFY = new Route({
		path: '/auth/verify',
		title: 'Email Verification',
		description: '',
		isProtected: false
	});

	// protected
	DASHBOARD = new Route({
		path: '/',
		title: 'Dashboard',
		isProtected: true
	});
	BRANCHES = new Route({
		path: '/(protected)/branches',
		title: 'Branches',
		isProtected: true,
		requiredPermission: PERMISSIONS.BRANCHES_READ
	});
	SINGLE_BRANCH = new Route({
		path: '/(protected)/branches/[id]',
		title: '',
		isProtected: true,
		requiredPermission: PERMISSIONS.BRANCHES_READ
	});
	STAFF = new Route({
		path: '/(protected)/staff',
		title: 'Staff',
		isProtected: true,
		requiredPermission: PERMISSIONS.STAFF_READ
	});
	WARDS = new Route({
		path: '/(protected)/wards',
		title: 'Wards',
		isProtected: true,
		requiredPermission: PERMISSIONS.WARDS_READ
	});
	PATIENTS = new Route({
		path: '/(protected)/patients',
		title: 'Patients',
		isProtected: true,
		requiredPermission: PERMISSIONS.PATIENTS_READ
	});
	AUDIT_LOGS = new Route({
		path: '/(protected)/audit-logs',
		title: 'Audit Logs',
		isProtected: true,
		requiredPermission: PERMISSIONS.AUDIT_READ
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
			this.BRANCHES,
			this.SINGLE_BRANCH,
			this.STAFF,
			this.PATIENTS,
			this.AUDIT_LOGS,
			this.PROFILE,
			this.NOTIFICATION,
			this.SETTINGS,
			this.WARDS
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

export function getRoute(routeId: string | undefined) {
	if (!routeId) return undefined;

	return ROUTES.allRoutes().find((route) => {
		return routeId === route.path;
	});
}

export default ROUTES;
