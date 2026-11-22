import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Handle } from '@sveltejs/kit';

vi.mock('$env/dynamic/private', () => ({ env: { JWT_PUBLIC_KEY: 'test-key' } }));
vi.mock('$lib/configs/routes.svelte', () => ({ default: { LOGIN: { path: '/auth/login' } } }));
vi.mock('jose', () => ({ importSPKI: vi.fn().mockResolvedValue({}), jwtVerify: vi.fn() }));

import { jwtVerify } from 'jose';
import { handle } from './hooks.server';

function request(routeId: string | null, pathname: string, token?: string) {
	const event = {
		route: { id: routeId },
		url: new URL(pathname, 'https://cariva.test'),
		cookies: { get: vi.fn().mockReturnValue(token), delete: vi.fn() },
		locals: {}
	};
	const resolve = vi.fn().mockResolvedValue(new Response('ok'));
	return {
		event,
		resolve,
		run: () => handle({ event, resolve } as unknown as Parameters<Handle>[0])
	};
}

describe('session protection', () => {
	beforeEach(() => vi.clearAllMocks());

	it.each([
		['/(protected)', '/'],
		['/(protected)/tenants/[id]', '/tenants/123'],
		['/(protected)/patients/[id]/encounters', '/patients/123/encounters']
	])('protects grouped route %s', async (routeId, pathname) => {
		const req = request(routeId, pathname);
		await expect(req.run()).rejects.toMatchObject({ status: 303 });
		expect(req.resolve).not.toHaveBeenCalled();
	});

	it.each([
		['/auth/login', '/auth/login'],
		['/auth/reset-password/[token]', '/auth/reset-password/abc'],
		['/auth/verify', '/auth/verify?token=abc'],
		[null, '/missing']
	])('allows public or missing route %s', async (routeId, pathname) => {
		const req = request(routeId, pathname);
		await expect(req.run()).resolves.toBeInstanceOf(Response);
		expect(jwtVerify).not.toHaveBeenCalled();
	});

	it('preserves the destination and query when redirecting', async () => {
		const req = request('/(protected)/tenants', '/tenants?status=active');
		await expect(req.run()).rejects.toMatchObject({
			location: '/auth/login?r=%2Ftenants%3Fstatus%3Dactive'
		});
	});

	it('marks a verified session before rendering', async () => {
		vi.mocked(jwtVerify).mockResolvedValueOnce({ payload: {} } as never);
		const req = request('/(protected)', '/', 'valid-token');
		await req.run();
		expect(req.event.locals).toMatchObject({ hasValidSession: true });
		expect(req.resolve).toHaveBeenCalledOnce();
	});

	it('clears an expired assertion without rendering protected content', async () => {
		vi.mocked(jwtVerify).mockRejectedValueOnce(new Error('expired'));
		const req = request('/(protected)', '/', 'expired-token');
		await expect(req.run()).rejects.toMatchObject({ status: 303 });
		expect(req.event.cookies.delete).toHaveBeenCalledOnce();
		expect(req.resolve).not.toHaveBeenCalled();
	});
});
