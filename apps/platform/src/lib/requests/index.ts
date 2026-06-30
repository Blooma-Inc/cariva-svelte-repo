import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { stores } from '$lib/store/index.svelte';
import ROUTES from '$lib/configs/routes.svelte';
import { browser } from '$app/environment';
import { NETWORK_ERR, setOffline, setOnline } from '$lib/utils/network';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

const NO_REDIRECT_ROUTES = [ROUTES.LOGIN.href] as string[];

const resourceReqInterceptor = async (config: InternalAxiosRequestConfig) => {
	const modifiedConfig = { ...config };

	if (typeof window !== 'undefined' && stores?.AuthStore) {
		const { ttl, token } = stores.AuthStore.isAuthenticated();
		const treshold = 5 * 60 * 1000;
		let _token = token;

		if (!_token) {
			_token = (await stores.AuthStore.getTokenFromCookie()) as unknown as string;
		}

		if (stores.AuthStore.isLoading.refresh === false && ttl < treshold && ttl > 0) {
			_token = await stores.AuthStore.fetchNewToken();
		}

		if (_token && modifiedConfig.headers) {
			modifiedConfig.headers.Authorization = `Bearer ${_token}`;
		}
	}
	return modifiedConfig;
};

const resourceResInterceptor = (response: AxiosResponse) => {
	setOnline();
	return response;
};

const resourceResErrorInterceptor = async (error: AxiosError) => {
	if (error.code === AxiosError.ERR_NETWORK) {
		setOffline(NETWORK_ERR);
	} else if (
		!browser &&
		!NO_REDIRECT_ROUTES.some((p) => window.location.pathname.includes(p)) &&
		error.response &&
		error.config
	) {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		if (error.response.status == 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const newAccessToken = await stores.AuthStore.fetchNewToken();

				if (newAccessToken) {
					originalRequest.headers = originalRequest.headers || {};
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

					return server(originalRequest);
				} else {
					throw new Error('No access token received');
				}
			} catch (refreshError) {
				console.error('Token refresh failed:', refreshError);

				localStorage.setItem('fromPath', window.location.pathname);
				stores.AuthStore.logout();

				return Promise.reject(refreshError);
			}
		}
	}

	return Promise.reject(error);
};

const server = axios.create({
	baseURL: PUBLIC_API_BASE_URL,
	headers: {
		'content-type': 'application/json'
	},
	withCredentials: true
});

export const serverwithoutInterceptor = axios.create({
	baseURL: PUBLIC_API_BASE_URL,
	headers: {
		'content-type': 'application/json'
	},
	withCredentials: true
});

export const uninterceptedServer = axios.create({
	baseURL: PUBLIC_API_BASE_URL,
	headers: {
		'content-type': 'application/json'
	}
});

export default server;

server.interceptors.request.use(resourceReqInterceptor);

server.interceptors.response.use(resourceResInterceptor, resourceResErrorInterceptor);
