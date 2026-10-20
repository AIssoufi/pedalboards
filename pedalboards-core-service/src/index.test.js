import { exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

import plugins from '../data/plugins.json';
import { toPluginId } from '../scripts/seed-sql.js';
import { MAX_PAGE_SIZE, MESSAGES } from './constants.js';

const API_URL = 'https://pedalboards.issoufi.fr/api';

/**
 * Calls the deployed entry of the Worker.
 *
 * @param {string} path - Path and query under /api, such as `/plugins?page=2`.
 * @param {RequestInit} [init] - Method and body of the request.
 * @returns {Promise<{ status: number, headers: Headers, body: any }>} The status, the headers and the parsed JSON body.
 */
const callApi = async (path, init) => {
	const response = await exports.default.fetch(`${API_URL}${path}`, init);
	return { status: response.status, headers: response.headers, body: await response.json() };
};

const byName = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());
const sortedNames = plugins.map(plugin => plugin.name).toSorted(byName);

describe('GET /api/plugins', () => {
	it('serves the first page of 10 plugins by default', async () => {
		const { status, headers, body } = await callApi('/plugins');

		expect(status).toBe(200);
		expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(body).toMatchObject({ msg: MESSAGES.pluginsFound, count: 50, currentPage: 1, numberPages: 5 });
		expect(body.data.map(plugin => plugin.name)).toEqual(sortedNames.slice(0, 10));
	});

	it('sorts by name before paging, so the pages follow each other without overlap', async () => {
		const pages = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9].map(page => callApi(`/plugins?page=${page}&pagesize=7`)));
		const names = pages.flatMap(({ body }) => body.data.map(plugin => plugin.name));

		expect(names).toEqual(sortedNames);
		expect(pages[8].body).toMatchObject({ data: [], count: 50, currentPage: 9, numberPages: 8 });
	});

	it('falls back to the default page and caps the page size', async () => {
		const { status, body } = await callApi('/plugins?page=abc&pagesize=1000');

		expect(status).toBe(200);
		expect(MAX_PAGE_SIZE).toBeGreaterThan(50);
		expect(body).toMatchObject({ count: 50, currentPage: 1, numberPages: 1 });
		expect(body.data).toHaveLength(50);
	});

	it('matches a plugin when one of the filtered fields holds the text, whatever the case', async () => {
		const { body } = await callApi('/plugins?pagesize=100&filterby[brand]=mda&filterby[categories]=delay');
		const expected = plugins.filter(plugin => plugin.brand.toLowerCase().includes('mda')
			|| plugin.categories.some(category => category.toLowerCase().includes('delay')));

		expect(body.count).toBe(expected.length);
		expect(body.data.map(plugin => plugin.name)).toEqual(expected.map(plugin => plugin.name).toSorted(byName));
	});

	it.each(['%', '_', '\\'])('searches "%s" as a literal character', async text => {
		const { status, body } = await callApi(`/plugins?filterby[name]=${encodeURIComponent(text)}`);

		expect(status).toBe(200);
		expect(body).toMatchObject({ data: [], count: 0, numberPages: 0 });
	});

	it('answers 400 with a short message to a field that cannot be searched', async () => {
		const { status, body } = await callApi('/plugins?filterby[description]=x');

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
	});
});

describe('GET /api/plugins/count', () => {
	it('counts all the plugins', async () => {
		const { body } = await callApi('/plugins/count');

		expect(body).toEqual({ msg: MESSAGES.pluginsCount, data: 50 });
	});

	it('counts the plugins whose name holds the text', async () => {
		const { body } = await callApi('/plugins/count?name=GX');
		const expected = plugins.filter(plugin => plugin.name.toLowerCase().includes('gx'));

		expect(body.data).toBe(expected.length);
	});

	it('answers 400 to a repeated name', async () => {
		const { status } = await callApi('/plugins/count?name=a&name=b');

		expect(status).toBe(400);
	});
});

describe('GET /api/plugin/:id', () => {
	it('serves each seed plugin as data/plugins.json holds it', async () => {
		const responses = await Promise.all(plugins.map(plugin => callApi(`/plugin/${toPluginId(plugin.name)}`)));

		responses.forEach(({ status, body }, index) => {
			expect(status).toBe(200);
			expect(body).toEqual({
				msg: MESSAGES.pluginFound,
				data: { _id: toPluginId(plugins[index].name), ...plugins[index] }
			});
		});
	});

	it('answers 404 to an unknown id', async () => {
		const { status, body } = await callApi('/plugin/unknown');

		expect(status).toBe(404);
		expect(body).toEqual({ msg: MESSAGES.pluginNotFound });
	});

	it('answers 400 to a malformed id', async () => {
		const { status, body } = await callApi('/plugin/%E0');

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
	});
});

describe('routes outside the read API', () => {
	it.each([
		['POST', '/plugin'],
		['PUT', '/plugin/abgate'],
		['DELETE', '/plugin/abgate'],
		['GET', '/unknown']
	])('answers %s %s with a JSON 404, since the Worker serves the read routes only', async (method, path) => {
		const { status, body } = await callApi(path, { method });

		expect(status).toBe(404);
		expect(body).toEqual({ msg: MESSAGES.routeNotFound });
	});
});
