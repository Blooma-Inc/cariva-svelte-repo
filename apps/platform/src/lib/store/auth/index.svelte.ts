import initializer from '$lib/utils/initializers';
import type { RootStore } from '../index.svelte';
import jwt from 'jsonwebtoken';

export function decodeJWT(token: string) {
	return jwt.decode(token) as IJwtPayloadExt;
}

const INIT_IS_LOADING = {
	logout: false,
	refresh: false
};

class AuthStore {
	rootStore: RootStore;

	isLoading = $state({ ...INIT_IS_LOADING });
	error = $state(initializer(this.isLoading, ''));

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	isAuthenticated(): TIsAuthenticated {
		return { ttl: 0, token: '', email: '' };
	}

	async login() {}
	async getTokenFromCookie() {}
	async fetchNewToken() {
		return '';
	}
	async logout() {}
	async logoutAll() {}
}

export default AuthStore;
