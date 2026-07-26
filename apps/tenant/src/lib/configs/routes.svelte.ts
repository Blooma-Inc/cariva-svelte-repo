import type { Pathname } from '$app/types';

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
	RESET_PWD = new Route({
		path: '/auth/reset-password/',
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
		path: '/branches',
		title: 'Branches',
		isProtected: true
	});
	STAFF = new Route({
		path: '/staff',
		title: 'Staff',
		isProtected: true
	});
	PATIENTS = new Route({
		path: '/patients',
		title: 'Patients',
		isProtected: true
	});
	AUDIT_LOGS = new Route({
		path: '/audit-logs',
		title: 'Audit Logs',
		isProtected: true
	});
	NOTIFICATION = new Route({
		path: '/notifications',
		title: 'Notifications',
		description: 'Users Notification',
		isProtected: true
	});
	PROFILE = new Route({
		path: '/profile',
		title: 'Profile',
		description: 'User Profile',
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
			this.RESET_PWD,
			this.VERIFY,
			this.DASHBOARD,
			this.BRANCHES,
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
