import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import { callServer } from '../../test/call-server.js';
import { createApp } from '../app.js';
import { MESSAGES } from '../constants.js';
import { toImageKey } from '../storage/images.js';
import { createImageRouter } from './images.js';

const { IMAGES: images } = env;

// Port of the test server, apart from those of the other test files
const IMAGE_SERVER_PORT = 9004;

const ID = 'served-plugin';
const PNG_BYTES = new Uint8Array([137, 80, 78, 71]);

createApp(createImageRouter(images)).listen(IMAGE_SERVER_PORT);

afterEach(async () => {
	await images.delete(toImageKey(ID));
});

describe('GET /api/images/:id', () => {
	it('serves the image with its type', async () => {
		await images.put(toImageKey(ID), PNG_BYTES, { httpMetadata: { contentType: 'image/png' } });

		const response = await callServer({ port: IMAGE_SERVER_PORT, path: `/images/${ID}?v=1` });

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('image/png');
		expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(PNG_BYTES);
	});

	it('serves an image without a stored type as bytes', async () => {
		await images.put(toImageKey(ID), PNG_BYTES);

		const response = await callServer({ port: IMAGE_SERVER_PORT, path: `/images/${ID}` });

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
	});

	it('answers 404 in JSON when the plugin has no image', async () => {
		const response = await callServer({ port: IMAGE_SERVER_PORT, path: '/images/unknown' });

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ msg: MESSAGES.imageNotFound });
	});
});
