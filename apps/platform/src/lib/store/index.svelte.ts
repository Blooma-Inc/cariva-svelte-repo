import jwt from 'jsonwebtoken';
import AppStore from './app/index.svelte';
import AuthStore from './auth/index.svelte';

export function decodeJWT(token: string) {
	return jwt.decode(token) as IJwtPayloadExt;
}

export class RootStore {
	AppStore: AppStore;
	AuthStore: AuthStore;

	constructor() {
		this.AppStore = new AppStore(this);
		this.AuthStore = new AuthStore(this);
	}
}

export const stores = new RootStore();
