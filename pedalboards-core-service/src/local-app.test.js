import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import { callServer } from '../test/call-server.js';
import { MESSAGES, WRITE_CORS_METHODS } from './constants.js';
import { createLocalApp } from './local-app.js';
import { deletePluginImage } from './storage/images.js';

const { DB: db, IMAGES: images } = env;

// Port of the test server, apart from those of the other test files
const LOCAL_SERVER_PORT = 9006;

const ID = 'local-gate';
const PNG_BYTES = new Uint8Array([137, 80, 78, 71]);

createLocalApp({ db, images }).listen(LOCAL_SERVER_PORT);

afterEach(async () => {
	await db.prepare('DELETE FROM plugins WHERE id = ?').bind(ID).run();
	await deletePluginImage({ images, id: ID });
});

describe('createLocalApp', () => {
	it.each(['/plugin', `/plugin/${ID}`])('answers the preflight request of %s with the write methods', async path => {
		const response = await callServer({ port: LOCAL_SERVER_PORT, method: 'OPTIONS', path });

		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe(WRITE_CORS_METHODS);
	});

	it('reads a created plugin and serves its image at its address', async () => {
		const form = new FormData();
		form.set('name', 'Local Gate');
		form.set('image', new File([PNG_BYTES], 'gate.png', { type: 'image/png' }));

		const created = await callServer({ port: LOCAL_SERVER_PORT, method: 'POST', path: '/plugin', form });
		const read = await callServer({ port: LOCAL_SERVER_PORT, path: `/plugin/${ID}` });
		const { data } = await read.json();
		const image = await callServer({ port: LOCAL_SERVER_PORT, path: new URL(data.screenshotUrl).pathname.replace(/^\/api/, '') });

		expect(created.status).toBe(201);
		expect(read.status).toBe(200);
		expect(data).toMatchObject({ _id: ID, name: 'Local Gate' });
		expect(image.status).toBe(200);
		expect(new Uint8Array(await image.arrayBuffer())).toEqual(PNG_BYTES);
	});

	it('answers 404 in JSON to an unknown route', async () => {
		const response = await callServer({ port: LOCAL_SERVER_PORT, path: '/unknown' });

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ msg: MESSAGES.routeNotFound });
	});
});
