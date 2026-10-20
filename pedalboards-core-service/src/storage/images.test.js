import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import { deletePluginImage, findPluginImage, savePluginImage, toImageKey, toImageUrl } from './images.js';

const { IMAGES: images } = env;

const ID = 'image-plugin';
const PNG_BYTES = new Uint8Array([137, 80, 78, 71]);
const JPEG_BYTES = new Uint8Array([255, 216, 255]);
const PNG = new File([PNG_BYTES], 'screenshot.png', { type: 'image/png' });
const JPEG = new File([JPEG_BYTES], 'screenshot.jpg', { type: 'image/jpeg' });

afterEach(async () => {
	await images.delete(toImageKey(ID));
});

describe('toImageKey', () => {
	it('prefixes the id of the plugin', () => {
		expect(toImageKey('mda-overdrive')).toBe('plugins/mda-overdrive');
	});
});

describe('toImageUrl', () => {
	it('gives the image route of the API with the version', () => {
		expect(toImageUrl({ origin: 'http://localhost:8080', id: 'mda-overdrive', version: 1 }))
			.toBe('http://localhost:8080/api/images/mda-overdrive?v=1');
	});

	it('encodes an id that is not URL-safe', () => {
		expect(toImageUrl({ origin: 'http://localhost:8080', id: 'a/b?c', version: 2 }))
			.toBe('http://localhost:8080/api/images/a%2Fb%3Fc?v=2');
	});
});

describe('savePluginImage', () => {
	it('saves the bytes and the type of the image', async () => {
		await savePluginImage({ images, id: ID, image: PNG });

		const saved = await findPluginImage({ images, id: ID });
		expect(saved.httpMetadata.contentType).toBe('image/png');
		expect(new Uint8Array(await saved.arrayBuffer())).toEqual(PNG_BYTES);
	});

	it('replaces the former image of the plugin', async () => {
		await savePluginImage({ images, id: ID, image: PNG });
		await savePluginImage({ images, id: ID, image: JPEG });

		const saved = await findPluginImage({ images, id: ID });
		expect(saved.httpMetadata.contentType).toBe('image/jpeg');
		expect(saved.size).toBe(JPEG_BYTES.byteLength);
	});
});

describe('findPluginImage', () => {
	it('gives null when the plugin has no image', async () => {
		expect(await findPluginImage({ images, id: 'unknown' })).toBeNull();
	});
});

describe('deletePluginImage', () => {
	it('deletes the image of the plugin', async () => {
		await savePluginImage({ images, id: ID, image: PNG });

		await deletePluginImage({ images, id: ID });

		expect(await findPluginImage({ images, id: ID })).toBeNull();
	});

	it('does nothing when the plugin has no image', async () => {
		await expect(deletePluginImage({ images, id: 'unknown' })).resolves.toBeUndefined();
	});
});
