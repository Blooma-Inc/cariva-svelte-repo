import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { stores } from '$lib/store/index.svelte';
import ROUTES from '$lib/configs/routes.svelte';
import { browser } from '$app/environment';
import { NETWORK_ERR, setOffline, setOnline } from '$lib/utils/network';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

const NO_REDIRECT_ROUTES = [ROUTES.LOGIN.path] as string[];

const resourceReqInterceptor = async (config: InternalAxiosRequestConfig) => {
	const modifiedConfig = { ...config };
	const token = stores.AuthStore.accessToken;

	if (token && modifiedConfig.headers) {
		modifiedConfig.headers.Authorization = `Bearer ${token}`;
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
		return Promise.reject(error);
	}

	if (
		browser &&
		!NO_REDIRECT_ROUTES.some((p) => window.location.pathname.includes(p)) &&
		error.response?.status === 401 &&
		error.config &&
		!(error.config as InternalAxiosRequestConfig & { _retry?: boolean })._retry
	) {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
		originalRequest._retry = true;

		try {
			const newToken = await stores.AuthStore.fetchNewToken();
			originalRequest.headers = originalRequest.headers || {};
			originalRequest.headers.Authorization = `Bearer ${newToken}`;
			return server(originalRequest);
		} catch (refreshError) {
			localStorage.setItem('fromPath', window.location.pathname);
			stores.AuthStore.logout();
			return Promise.reject(refreshError);
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
