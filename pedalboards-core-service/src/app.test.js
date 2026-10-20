import { httpServerHandler } from 'cloudflare:node';
import { Router } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from './app.js';
import { MESSAGES } from './constants.js';
import { createReadRouter } from './routes/read.js';

// Ports of the test servers, apart from the one of the Worker entry
const BROKEN_DATABASE_PORT = 9001;
const FAILING_ROUTE_PORT = 9002;

const brokenDb = {
	prepare: () => {
		throw new Error('D1_ERROR: no such table: plugins at offset 14 (SQLITE_ERROR)');
	}
};
const failingRouter = Router().get('/fail', () => {
	throw new Error('Unexpected failure');
});

createApp(createReadRouter(brokenDb)).listen(BROKEN_DATABASE_PORT);
createApp(failingRouter).listen(FAILING_ROUTE_PORT);

/**
 * Calls one of the test servers.
 *
 * @param {Object} params
 * @param {number} params.port - Port of the server.
 * @param {string} params.path - Path under /api.
 * @returns {Promise<{ status: number, text: string }>} The status and the raw body.
 */
const callServer = async ({ port, path }) => {
	const response = await httpServerHandler({ port }).fetch(new Request(`https://pedalboards.issoufi.fr/api${path}`));
	return { status: response.status, text: await response.text() };
};

describe('createApp', () => {
	it.each(['/plugins', '/plugins/count', '/plugin/abgate'])('answers %s with 503 when the database fails', async path => {
		const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

		const { status, text } = await callServer({ port: BROKEN_DATABASE_PORT, path });

		expect(status).toBe(503);
		expect(JSON.parse(text)).toEqual({ msg: MESSAGES.databaseError });
		expect(text).not.toContain('SQLITE_ERROR');
		expect(logError).toHaveBeenCalledOnce();
	});

	it('answers an unexpected error with 500 and no stack', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const { status, text } = await callServer({ port: FAILING_ROUTE_PORT, path: '/fail' });

		expect(status).toBe(500);
		expect(JSON.parse(text)).toEqual({ msg: MESSAGES.internalError });
		expect(text).not.toContain('Unexpected failure');
	});
});
