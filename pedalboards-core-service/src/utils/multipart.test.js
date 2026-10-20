import { Router } from 'express';
import { describe, expect, it } from 'vitest';

import { callServer } from '../../test/call-server.js';
import { createApp } from '../app.js';
import { MAX_FORM_BYTES, MESSAGES } from '../constants.js';
import { isBadBodyError, parseMultipartForm, splitFormEntries } from './multipart.js';

// Port of the test server, apart from those of the other test files
const FORM_SERVER_PORT = 9005;

// Answers what the parser read: the text fields, and the name, type and size of each file
const echoRouter = Router().post('/form', parseMultipartForm, (req, res) => {
	const files = Object.entries(req.files).map(([name, { name: fileName, type, size }]) => [name, { fileName, type, size }]);
	res.json({ fields: req.body, files: Object.fromEntries(files) });
});

createApp(echoRouter).listen(FORM_SERVER_PORT);

/**
 * Builds a form from its entries.
 *
 * @param {[string, string | File][]} entries - Name and value of each entry, in order.
 * @returns {FormData} The form.
 */
const toForm = entries => {
	const form = new FormData();
	entries.forEach(([name, value]) => form.append(name, value));
	return form;
};

const PNG = new File([new Uint8Array([137, 80, 78, 71])], 'gate.png', { type: 'image/png' });

describe('splitFormEntries', () => {
	it('puts the text fields and the files apart', () => {
		const { fields, files } = splitFormEntries(toForm([['name', 'Gate'], ['image', PNG]]));

		expect(fields).toEqual({ name: 'Gate' });
		expect(files.image.name).toBe('gate.png');
	});

	it('keeps the last value of a repeated name', () => {
		expect(splitFormEntries(toForm([['name', 'A'], ['name', 'B']])).fields).toEqual({ name: 'B' });
	});

	it('gives empty fields and files for an empty form', () => {
		expect(splitFormEntries(new FormData())).toEqual({ fields: {}, files: {} });
	});
});

describe('isBadBodyError', () => {
	it.each([400, 413, 415, 499])('tells that a %i status is a bad body', status => {
		expect(isBadBodyError({ status })).toBe(true);
	});

	it.each([399, 500, 503, undefined, Number.NaN])('tells that a %s status is a failure of the server', status => {
		expect(isBadBodyError({ status })).toBe(false);
	});

	it.each([undefined, null, new Error('boom')])('tells that %s without a status is a failure of the server', error => {
		expect(isBadBodyError(error)).toBe(false);
	});
});

describe('parseMultipartForm', () => {
	it('reads the text fields and the files of a multipart form', async () => {
		const response = await callServer({
			port: FORM_SERVER_PORT,
			method: 'POST',
			path: '/form',
			form: toForm([['name', 'Gate'], ['categories', 'Dynamics,Gate'], ['image', PNG]])
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			fields: { name: 'Gate', categories: 'Dynamics,Gate' },
			files: { image: { fileName: 'gate.png', type: 'image/png', size: 4 } }
		});
	});

	it('gives empty fields and files for a body that is not multipart', async () => {
		const response = await callServer({
			port: FORM_SERVER_PORT,
			method: 'POST',
			path: '/form',
			body: '{"name":"Gate"}',
			contentType: 'application/json'
		});

		expect(await response.json()).toEqual({ fields: {}, files: {} });
	});

	it('gives empty fields and files without a body', async () => {
		const response = await callServer({ port: FORM_SERVER_PORT, method: 'POST', path: '/form' });

		expect(await response.json()).toEqual({ fields: {}, files: {} });
	});

	it.each([
		['a body without its boundary', 'multipart/form-data; boundary=missing', 'name=Gate'],
		['a type without a boundary', 'multipart/form-data', '--x\r\n\r\nGate\r\n--x--\r\n']
	])('answers 400 to %s', async (title, contentType, body) => {
		const response = await callServer({ port: FORM_SERVER_PORT, method: 'POST', path: '/form', body, contentType });

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ msg: MESSAGES.invalidInput });
	});

	it('answers 400 to a form larger than MAX_FORM_BYTES', async () => {
		const largeFile = new File([new Uint8Array(MAX_FORM_BYTES + 1)], 'large.png', { type: 'image/png' });

		const response = await callServer({ port: FORM_SERVER_PORT, method: 'POST', path: '/form', form: toForm([['image', largeFile]]) });

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ msg: MESSAGES.invalidInput });
	});
});
