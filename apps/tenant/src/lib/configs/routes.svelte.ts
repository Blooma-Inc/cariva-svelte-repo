import { resolve } from '$app/paths';
import type { RouteId, RouteParams } from '$app/types';

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
		isProtected: true
	});
	SINGLE_BRANCH = new Route({
		path: '/(protected)/branches/[id]',
		title: '',
		isProtected: true
	});
	STAFF = new Route({
		path: '/(protected)/staff',
		title: 'Staff',
		isProtected: true
	});
	PATIENTS = new Route({
		path: '/(protected)/patients',
		title: 'Patients',
		isProtected: true
	});
	AUDIT_LOGS = new Route({
		path: '/(protected)/audit-logs',
		title: 'Audit Logs',
		isProtected: true
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
