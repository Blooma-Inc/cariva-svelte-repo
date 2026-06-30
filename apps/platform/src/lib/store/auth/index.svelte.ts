import initializer from '$lib/utils/initializers';
import type { TLoginSchema } from '../../../routes/auth/login/validator';
import type { RootStore } from '../index.svelte';

const INIT_IS_LOADING = {
	logout: false,
	refresh: false
};

class AuthStore {
	rootStore: RootStore;

	isLoading = $state({ ...INIT_IS_LOADING });
	error = $state(initializer(this.isLoading, ''));
	user = $state({
		name: 'Platform Admin',
		email: 'admin@blooma.com',
		avatar: ''
	});

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	isAuthenticated(): TIsAuthenticated {
		return { ttl: 0, token: '', email: '' };
	}

	async login(payload: TLoginSchema) {
		console.log('login function called: ', JSON.stringify(payload));
	}
	async getTokenFromCookie() {}
	async fetchNewToken() {
		return '';
	}
	async logout() {}
	async logoutAll() {}
}

export default AuthStore;
