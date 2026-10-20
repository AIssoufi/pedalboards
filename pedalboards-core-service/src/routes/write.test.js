import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { callServer } from '../../test/call-server.js';
import { createApp } from '../app.js';
import { MAX_PLUGIN_IMAGE_BYTES, MESSAGES, WRITE_CORS_METHODS } from '../constants.js';
import { insertPlugin } from '../db/plugin-writes.js';
import { countPlugins, findPluginById } from '../db/plugins.js';
import { findPluginImage, savePluginImage, toImageKey } from '../storage/images.js';
import { createWriteRouter } from './write.js';

const { DB: db, IMAGES: images } = env;

// Port of the test server, apart from those of the other test files
const WRITE_SERVER_PORT = 9003;

createApp(createWriteRouter({ db, images })).listen(WRITE_SERVER_PORT);

// Plugin that each test starts with. The tests share the local D1 and R2, so each one cleans up
const FIXTURE = {
	id: 'fixture-fuzz',
	name: 'Fixture Fuzz',
	label: 'Fuzz',
	brand: 'Fixture',
	categories: ['Distortion'],
	author: { name: 'Fixture' },
	controlPorts: [{ name: 'Gain', min: 0, max: 1, default: 0.5 }]
};

// The id that the create form below gives
const NEW_ID = 'new-gate';

// The fields of the create form of the CMS, which sends every value as text
const FORM_FIELDS = {
	name: 'New Gate',
	label: 'Gate',
	uri: 'http://example.com/plugins/gate',
	version: '1.0',
	brand: 'Example',
	categories: 'Dynamics, Gate',
	description: 'A noise gate',
	controlPorts: '[{"name":"Threshold","default":0.25,"max":1,"min":0}]',
	author: '{"avatarUrl":"","name":""}'
};

const PNG_BYTES = new Uint8Array([137, 80, 78, 71]);
const PNG = new File([PNG_BYTES], 'gate.png', { type: 'image/png' });

// Page, and its size, that the delete test asks for
const PAGE = 2;
const PAGE_SIZE = 4;

const toImageUrlPattern = id => new RegExp(`^http://pedalboards\\.issoufi\\.fr/api/images/${id}\\?v=\\d+$`);

/**
 * Builds a form from text fields and files.
 *
 * @param {Record<string, string | File>} entries - Value of each field.
 * @returns {FormData} The form.
 */
const toForm = entries => {
	const form = new FormData();
	Object.entries(entries).forEach(([name, value]) => form.append(name, value));
	return form;
};

/**
 * Calls the test server and reads its JSON answer.
 *
 * @param {Object} params
 * @param {string} params.method - HTTP method.
 * @param {string} params.path - Path and query under /api.
 * @param {FormData} [params.form] - Form to send.
 * @returns {Promise<{ status: number, body: any }>} The status and the parsed JSON body.
 */
const callApi = async params => {
	const response = await callServer({ port: WRITE_SERVER_PORT, ...params });
	return { status: response.status, body: await response.json() };
};

beforeEach(async () => {
	await insertPlugin({ db, plugin: FIXTURE });
});

afterEach(async () => {
	await db.prepare('DELETE FROM plugins WHERE id IN (?, ?)').bind(FIXTURE.id, NEW_ID).run();
	await images.delete([toImageKey(FIXTURE.id), toImageKey(NEW_ID)]);
});

describe('POST /api/plugin', () => {
	it('creates a plugin with its image', async () => {
		const { status, body } = await callApi({ method: 'POST', path: '/plugin', form: toForm({ ...FORM_FIELDS, image: PNG }) });

		expect(status).toBe(201);
		expect(body.msg).toBe(MESSAGES.pluginCreated);
		expect(body.data).toMatchObject({
			_id: NEW_ID,
			name: 'New Gate',
			label: 'Gate',
			categories: ['Dynamics', 'Gate'],
			controlPorts: [{ name: 'Threshold', default: 0.25, max: 1, min: 0 }],
			author: { avatarUrl: '', name: '' },
			pedalboardCount: 0
		});
		expect(body.data.screenshotUrl).toMatch(toImageUrlPattern(NEW_ID));
		expect(await findPluginById({ db, id: NEW_ID })).toEqual(body.data);
		const image = await findPluginImage({ images, id: NEW_ID });
		expect(image.httpMetadata.contentType).toBe('image/png');
		expect(new Uint8Array(await image.arrayBuffer())).toEqual(PNG_BYTES);
	});

	it.each([
		['no image', {}],
		['an empty file input', { image: new File([], '', { type: 'application/octet-stream' }) }]
	])('creates a plugin without a screenshot from a form with %s', async (title, files) => {
		const { status, body } = await callApi({ method: 'POST', path: '/plugin', form: toForm({ ...FORM_FIELDS, ...files }) });

		expect(status).toBe(201);
		expect(body.data.screenshotUrl).toBe('');
		expect(await findPluginImage({ images, id: NEW_ID })).toBeNull();
	});

	it('answers 409 to a name that gives the id of another plugin, and keeps that plugin', async () => {
		const fixturePlugin = await findPluginById({ db, id: FIXTURE.id });

		const { status, body } = await callApi({
			method: 'POST',
			path: '/plugin',
			form: toForm({ ...FORM_FIELDS, name: 'FIXTURE fuzz!', image: PNG })
		});

		expect(status).toBe(409);
		expect(body).toEqual({ msg: MESSAGES.pluginExists });
		expect(await findPluginById({ db, id: FIXTURE.id })).toEqual(fixturePlugin);
		expect(await findPluginImage({ images, id: FIXTURE.id })).toBeNull();
	});

	it.each([
		['no name', { ...FORM_FIELDS, name: undefined }],
		['a name without letters nor digits', { ...FORM_FIELDS, name: '!!' }],
		['an invalid author', { ...FORM_FIELDS, author: '{' }],
		['an author that is not an object', { ...FORM_FIELDS, author: '[]' }],
		['control ports that are not a list', { ...FORM_FIELDS, controlPorts: '{}' }],
		['a negative pedalboard count', { ...FORM_FIELDS, pedalboardCount: '-1' }],
		['an SVG image', { ...FORM_FIELDS, image: new File(['<svg/>'], 'gate.svg', { type: 'image/svg+xml' }) }],
		['an image larger than 5 MiB', { ...FORM_FIELDS, image: new File([new Uint8Array(MAX_PLUGIN_IMAGE_BYTES + 1)], 'gate.png', { type: 'image/png' }) }]
	])('answers 400 to a form with %s, and creates nothing', async (title, fields) => {
		const definedFields = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
		const countBefore = await countPlugins({ db, filters: {} });

		const { status, body } = await callApi({ method: 'POST', path: '/plugin', form: toForm(definedFields) });

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
		expect(await countPlugins({ db, filters: {} })).toBe(countBefore);
	});

	it('answers 400 to a request without a form', async () => {
		const response = await callServer({
			port: WRITE_SERVER_PORT,
			method: 'POST',
			path: '/plugin',
			body: JSON.stringify({ name: 'New Gate' }),
			contentType: 'application/json'
		});

		expect(response.status).toBe(400);
		expect(await findPluginById({ db, id: NEW_ID })).toBeNull();
	});
});

describe('PUT /api/plugin/:id', () => {
	it('changes the given fields and keeps the others', async () => {
		const fixturePlugin = await findPluginById({ db, id: FIXTURE.id });

		const { status, body } = await callApi({
			method: 'PUT',
			path: `/plugin/${FIXTURE.id}`,
			form: toForm({ label: 'Big Fuzz', categories: 'Distortion,Fuzz', pedalboardCount: '7' })
		});

		expect(status).toBe(200);
		expect(body).toEqual({
			msg: MESSAGES.pluginUpdated,
			data: { ...fixturePlugin, label: 'Big Fuzz', categories: ['Distortion', 'Fuzz'], pedalboardCount: 7 }
		});
		expect(await findPluginById({ db, id: FIXTURE.id })).toEqual(body.data);
	});

	it('replaces the image and its address', async () => {
		await savePluginImage({ images, id: FIXTURE.id, image: new File(['old'], 'old.gif', { type: 'image/gif' }) });

		const { status, body } = await callApi({ method: 'PUT', path: `/plugin/${FIXTURE.id}`, form: toForm({ image: PNG }) });

		expect(status).toBe(200);
		expect(body.data.screenshotUrl).toMatch(toImageUrlPattern(FIXTURE.id));
		expect(body.data.label).toBe(FIXTURE.label);
		const image = await findPluginImage({ images, id: FIXTURE.id });
		expect(image.httpMetadata.contentType).toBe('image/png');
	});

	it('keeps the image when the form has an empty file input', async () => {
		const { body } = await callApi({
			method: 'PUT',
			path: `/plugin/${FIXTURE.id}`,
			form: toForm({ label: 'Big Fuzz', image: new File([], '', { type: 'application/octet-stream' }) })
		});

		expect(body.data.screenshotUrl).toBe('');
		expect(body.data.label).toBe('Big Fuzz');
	});

	it('answers 404 to an unknown plugin and stores no image', async () => {
		const { status, body } = await callApi({ method: 'PUT', path: `/plugin/${NEW_ID}`, form: toForm({ label: 'Gate', image: PNG }) });

		expect(status).toBe(404);
		expect(body).toEqual({ msg: MESSAGES.pluginNotFound });
		expect(await findPluginImage({ images, id: NEW_ID })).toBeNull();
	});

	it.each([
		['no field', {}],
		['only fields that are not saved', { _id: 'other', stable: 'true' }],
		['an empty name', { name: ' ' }],
		['invalid control ports', { controlPorts: '[1]' }],
		['a pedalboard count with decimals', { pedalboardCount: '1.5' }],
		['an image that is not one', { image: new File(['<html>'], 'page.html', { type: 'text/html' }) }]
	])('answers 400 to a form with %s, and changes nothing', async (title, fields) => {
		const fixturePlugin = await findPluginById({ db, id: FIXTURE.id });

		const { status, body } = await callApi({ method: 'PUT', path: `/plugin/${FIXTURE.id}`, form: toForm(fields) });

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
		expect(await findPluginById({ db, id: FIXTURE.id })).toEqual(fixturePlugin);
	});
});

describe('DELETE /api/plugin/:id', () => {
	it('deletes a plugin and its image, and gives the page that follows', async () => {
		await savePluginImage({ images, id: FIXTURE.id, image: PNG });

		const { status, body } = await callApi({ method: 'DELETE', path: `/plugin/${FIXTURE.id}?page=${PAGE}&pagesize=${PAGE_SIZE}&filterby[brand]=mda` });

		expect(status).toBe(200);
		expect(body).toMatchObject({ msg: MESSAGES.pluginDeleted, deletedCount: 1, currentPage: PAGE });
		expect(body.numberPages).toBe(Math.ceil(body.count / PAGE_SIZE));
		expect(body.data.length).toBeLessThanOrEqual(PAGE_SIZE);
		expect(body.data.every(plugin => /mda/i.test(plugin.brand))).toBe(true);
		expect(await findPluginById({ db, id: FIXTURE.id })).toBeNull();
		expect(await findPluginImage({ images, id: FIXTURE.id })).toBeNull();
	});

	it('counts 0 deleted plugins for an unknown id, and still gives the page', async () => {
		const countBefore = await countPlugins({ db, filters: {} });

		const { status, body } = await callApi({ method: 'DELETE', path: '/plugin/unknown' });

		expect(status).toBe(200);
		expect(body).toMatchObject({ deletedCount: 0, count: countBefore, currentPage: 1 });
	});

	it('answers 400 to an unknown filter, and deletes nothing', async () => {
		const { status, body } = await callApi({ method: 'DELETE', path: `/plugin/${FIXTURE.id}?filterby[secret]=x` });

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
		expect(await findPluginById({ db, id: FIXTURE.id })).not.toBeNull();
	});
});

describe('CORS', () => {
	it('answers the preflight request of the CMS with the write methods', async () => {
		const response = await callServer({ port: WRITE_SERVER_PORT, method: 'OPTIONS', path: `/plugin/${FIXTURE.id}` });

		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe(WRITE_CORS_METHODS);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});
