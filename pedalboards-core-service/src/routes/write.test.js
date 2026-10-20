import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';
import { MESSAGES } from '../constants.js';
import { InvalidInputError } from '../errors.js';
import { createWriteRouter, parseJsonField, readPluginForm } from './write.js';

// Port of the test server, apart from the one of the Worker entry
const WRITE_SERVER_PORT = 9003;

const IMAGE = { fieldname: 'image', mimetype: 'image/png' };

// Stands for multer: parses a JSON body and attaches the image
const upload = {
	single: () => [express.json(), (req, res, next) => {
		req.file = IMAGE;
		next();
	}],
	none: () => express.json()
};
const store = {
	createPlugin: vi.fn(async ({ plugin }) => ({ _id: 'new-plugin', ...plugin })),
	updatePlugin: vi.fn(async ({ id, changes }) => ({ _id: id, ...changes })),
	deletePlugin: vi.fn(async () => ({ data: [{ _id: 'abgate' }], count: 21, deletedCount: 1 }))
};

createApp(createWriteRouter({ store, upload })).listen(WRITE_SERVER_PORT);

const FORM = {
	author: '{"name":"MDA"}',
	brand: 'MDA',
	categories: ' Distortion,Simulator ',
	controlPorts: '[]',
	description: 'Overdrive',
	label: 'Overdrive',
	name: 'MDA Overdrive',
	pedalboardCount: '0',
	uri: 'http://moddevices.com/plugins/mda/Overdrive',
	version: '1:0.3-6'
};

/**
 * Calls the test server.
 *
 * @param {Object} params
 * @param {string} params.method - HTTP method.
 * @param {string} params.path - Path and query under /api.
 * @param {Object} [params.body] - JSON body.
 * @returns {Promise<{ status: number, body: any }>} The status and the parsed JSON body.
 */
const callServer = async ({ method, path, body }) => {
	const text = body ? JSON.stringify(body) : '';
	// Express reads a body only when the request gives its length, as browsers do
	const request = new Request(`https://pedalboards.issoufi.fr/api${path}`, {
		method,
		headers: { 'Content-Type': 'application/json', 'Content-Length': String(new TextEncoder().encode(text).length) },
		body: body && text
	});
	const response = await httpServerHandler({ port: WRITE_SERVER_PORT }).fetch(request);
	return { status: response.status, body: await response.json() };
};

describe('parseJsonField', () => {
	it('parses a JSON value', () => {
		expect(parseJsonField('{"name":"MDA"}')).toEqual({ name: 'MDA' });
	});

	it.each(['{', '', undefined])('refuses %j', value => {
		expect(() => parseJsonField(value)).toThrow(InvalidInputError);
	});
});

describe('readPluginForm', () => {
	it('parses the JSON fields and splits the categories', () => {
		expect(readPluginForm(FORM)).toMatchObject({
			author: { name: 'MDA' },
			categories: ['Distortion', 'Simulator'],
			controlPorts: []
		});
	});

	it('refuses a form without categories', () => {
		expect(() => readPluginForm({ ...FORM, categories: undefined })).toThrow(InvalidInputError);
	});
});

describe('createWriteRouter', () => {
	it('creates a plugin with its image', async () => {
		const { status, body } = await callServer({ method: 'POST', path: '/plugin', body: FORM });

		expect(status).toBe(201);
		expect(body.msg).toBe(MESSAGES.pluginCreated);
		expect(store.createPlugin).toHaveBeenCalledWith({ plugin: readPluginForm(FORM), image: IMAGE });
	});

	it('answers 400 to a form with invalid JSON', async () => {
		const { status, body } = await callServer({ method: 'POST', path: '/plugin', body: { ...FORM, author: '{' } });

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
	});

	it('updates a plugin', async () => {
		const { status, body } = await callServer({ method: 'PUT', path: '/plugin/abgate', body: { label: 'Gate' } });

		expect(status).toBe(200);
		expect(body).toEqual({ msg: MESSAGES.pluginUpdated, data: { _id: 'abgate', label: 'Gate' } });
	});

	it('deletes a plugin and gives the page that follows', async () => {
		const { status, body } = await callServer({ method: 'DELETE', path: '/plugin/abgate?page=3&pagesize=5&filterby[brand]=mda' });

		expect(status).toBe(200);
		expect(store.deletePlugin).toHaveBeenCalledWith({ id: 'abgate', page: 3, pageSize: 5, filters: { brand: 'mda' } });
		expect(body).toEqual({
			msg: MESSAGES.pluginDeleted,
			data: [{ _id: 'abgate' }],
			count: 21,
			deletedCount: 1,
			currentPage: 3,
			numberPages: 5
		});
	});
});
