import { httpServerHandler } from 'cloudflare:node';
import { Router } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from './app.js';
import { MESSAGES } from './constants.js';
import { ConflictError } from './errors.js';
import { setReadCacheHeaders } from './middlewares.js';
import { createReadRouter } from './routes/read.js';

// Ports of the test servers, apart from the one of the Worker entry
const BROKEN_DATABASE_PORT = 9001;
const FAILING_ROUTE_PORT = 9002;
const CACHED_ROUTE_PORT = 9003;

// A read router that answers every method with a success, whatever its place among the routers
const cachedRouter = Router()
	.use(setReadCacheHeaders)
	.all('/created', (req, res) => {
		res.status(201).json({});
	});

const brokenDb = {
	prepare: () => {
		throw new Error('D1_ERROR: no such table: plugins at offset 14 (SQLITE_ERROR)');
	}
};
const failingRouter = Router()
	.get('/fail', () => {
		throw new Error('Unexpected failure');
	})
	.get('/conflict', () => {
		throw new ConflictError('Plugin id taken');
	});

createApp(createReadRouter(brokenDb)).listen(BROKEN_DATABASE_PORT);
createApp(failingRouter).listen(FAILING_ROUTE_PORT);
createApp(cachedRouter).listen(CACHED_ROUTE_PORT);

/**
 * Calls one of the test servers.
 *
 * @param {Object} params
 * @param {number} params.port - Port of the server.
 * @param {string} params.path - Path under /api.
 * @param {string} [params.method] - HTTP method, GET by default.
 * @returns {Promise<{ status: number, headers: Headers, text: string }>} The status, the headers and the raw body.
 */
const callServer = async ({ port, path, method = 'GET' }) => {
	const response = await httpServerHandler({ port }).fetch(new Request(`https://pedalboards.issoufi.fr/api${path}`, { method }));
	return { status: response.status, headers: response.headers, text: await response.text() };
};

describe('createApp', () => {
	it.each(['/plugins', '/plugins/count', '/plugin/abgate'])('answers %s with 503 when the database fails', async path => {
		const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

		const { status, headers, text } = await callServer({ port: BROKEN_DATABASE_PORT, path });

		expect(status).toBe(503);
		expect(headers.get('Cache-Control')).toBe('no-store');
		expect(JSON.parse(text)).toEqual({ msg: MESSAGES.databaseError });
		expect(text).not.toContain('SQLITE_ERROR');
		expect(logError).toHaveBeenCalledOnce();
	});

	it('answers an unexpected error with 500 and no stack', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const { status, headers, text } = await callServer({ port: FAILING_ROUTE_PORT, path: '/fail' });

		expect(status).toBe(500);
		expect(headers.get('Cache-Control')).toBe('no-store');
		expect(JSON.parse(text)).toEqual({ msg: MESSAGES.internalError });
		expect(text).not.toContain('Unexpected failure');
	});

	it('answers a plugin that already exists with 409, without logging it', async () => {
		const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

		const { status, text } = await callServer({ port: FAILING_ROUTE_PORT, path: '/conflict' });

		expect(status).toBe(409);
		expect(JSON.parse(text)).toEqual({ msg: MESSAGES.pluginExists });
		expect(logError).not.toHaveBeenCalled();
	});

	it.each([
		['GET', 'public, max-age=60'],
		['HEAD', 'public, max-age=60'],
		['POST', 'no-store'],
		['PUT', 'no-store'],
		['DELETE', 'no-store']
	])('answers a successful %s on a read router with Cache-Control %s', async (method, expected) => {
		const { status, headers } = await callServer({ port: CACHED_ROUTE_PORT, path: '/created', method });

		expect(status).toBe(201);
		expect(headers.get('Cache-Control')).toBe(expected);
	});
});
