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
	// landing
	DASHBOARD = new Route('/', 'Dashboard', '');
	LOGIN = new Route('/auth/login', 'Login', 'Login page');
}

const ROUTES = new Routes();

export default ROUTES;
