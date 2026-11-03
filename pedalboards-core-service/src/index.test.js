import { exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

import plugins from '../data/plugins.json';
import { MAX_PAGE_SIZE, MESSAGES } from './constants.js';
import { toPluginId } from './utils/plugin-id.js';

const API_URL = 'https://pedalboards.issoufi.fr/api';

/**
 * Calls the deployed entry of the Worker.
 *
 * @param {Object} params
 * @param {string} params.path - Path and query under /api, such as `/plugins?page=2`.
 * @param {string} [params.method] - Method of the request, `GET` by default.
 * @returns {Promise<{ status: number, headers: Headers, body: any }>} The status, the headers and the parsed JSON body.
 */
const callApi = async ({ path, method }) => {
	const response = await exports.default.fetch(`${API_URL}${path}`, { method });
	return { status: response.status, headers: response.headers, body: await response.json() };
};

const FIRST_THREE_LABELS = ['abGate', 'Ambience', 'AutoFilter'];

// The labels in the order of COLLATE NOCASE, which compares bytes with the ASCII letters in one case
const byLabel = (a, b) => {
	const [first, second] = [a.toLowerCase(), b.toLowerCase()];
	if (first === second) return 0;
	return first < second ? -1 : 1;
};
const sortedLabels = plugins.map(plugin => plugin.label).toSorted(byLabel);

describe('GET /api/plugins', () => {
	it('serves the first page of 10 plugins by default', async () => {
		const { status, headers, body } = await callApi({ path: '/plugins' });

		expect(status).toBe(200);
		expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(body).toMatchObject({ msg: MESSAGES.pluginsFound, count: 50, currentPage: 1, numberPages: 5 });
		expect(body.data.map(plugin => plugin.label)).toEqual(sortedLabels.slice(0, 10));
	});

	it('follows the printed labels whatever their case', async () => {
		const { body } = await callApi({ path: '/plugins' });

		expect(body.data.slice(0, FIRST_THREE_LABELS.length).map(plugin => plugin.label)).toEqual(FIRST_THREE_LABELS);
	});

	it('sorts by label before paging, so the pages follow each other without overlap', async () => {
		const pages = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9].map(page => callApi({ path: `/plugins?page=${page}&pagesize=7` })));
		const labels = pages.flatMap(({ body }) => body.data.map(plugin => plugin.label));

		expect(labels).toEqual(sortedLabels);
		expect(pages[8].body).toMatchObject({ data: [], count: 50, currentPage: 9, numberPages: 8 });
	});

	it('finds a word of the label that the name lacks, and a word of the name that the label lacks', async () => {
		const search = text => callApi({ path: `/plugins?pagesize=100&filterby[name]=${text}&filterby[label]=${text}` });
		const [{ body: byPrintedWord }, { body: byHiddenWord }] = await Promise.all([search('SPhaser'), search('Invada')]);

		expect(byPrintedWord.data.map(plugin => plugin.label)).toEqual(['SPhaser Stereo', 'SPhaser Sum']);
		expect(byHiddenWord.data.map(plugin => plugin.label)).toEqual(expect.arrayContaining(['SPhaser Stereo', 'SPhaser Sum']));
	});

	it('falls back to the default page and caps the page size', async () => {
		const { status, body } = await callApi({ path: '/plugins?page=abc&pagesize=1000' });

		expect(status).toBe(200);
		expect(MAX_PAGE_SIZE).toBeGreaterThan(50);
		expect(body).toMatchObject({ count: 50, currentPage: 1, numberPages: 1 });
		expect(body.data).toHaveLength(50);
	});

	it('matches a plugin when one of the filtered fields holds the text, whatever the case', async () => {
		const { body } = await callApi({ path: '/plugins?pagesize=100&filterby[brand]=mda&filterby[categories]=delay' });
		const expected = plugins.filter(plugin => plugin.brand.toLowerCase().includes('mda')
			|| plugin.categories.some(category => category.toLowerCase().includes('delay')));

		expect(body.count).toBe(expected.length);
		expect(body.data.map(plugin => plugin.label)).toEqual(expected.map(plugin => plugin.label).toSorted(byLabel));
	});

	it.each(['%', '_', '\\'])('searches "%s" as a literal character', async text => {
		const { status, body } = await callApi({ path: `/plugins?filterby[name]=${encodeURIComponent(text)}` });

		expect(status).toBe(200);
		expect(body).toMatchObject({ data: [], count: 0, numberPages: 0 });
	});

	it.each([
		{ description: '48 ASCII letters', text: 'a'.repeat(48), expected: 200 },
		{ description: '49 ASCII letters', text: 'a'.repeat(49), expected: 400 },
		{ description: '46 letters and an escaped "%"', text: `${'a'.repeat(46)}%`, expected: 200 },
		{ description: '47 letters and an escaped "%"', text: `${'a'.repeat(47)}%`, expected: 400 },
		{ description: '46 letters and an escaped "_"', text: `${'a'.repeat(46)}_`, expected: 200 },
		{ description: '47 letters and an escaped "_"', text: `${'a'.repeat(47)}_`, expected: 400 },
		{ description: '46 letters and a two-byte "é"', text: `${'a'.repeat(46)}é`, expected: 200 },
		{ description: '47 letters and a two-byte "é"', text: `${'a'.repeat(47)}é`, expected: 400 }
	])('answers $expected, never a 503 of D1, to a search of $description', async ({ text, expected }) => {
		const { status, body } = await callApi({ path: `/plugins?filterby[brand]=${encodeURIComponent(text)}` });

		expect(status).toBe(expected);
		expect(body.msg).toBe(expected === 200 ? MESSAGES.pluginsFound : MESSAGES.invalidInput);
	});

	it('answers 400 with a short message to a field that cannot be searched', async () => {
		const { status, body } = await callApi({ path: '/plugins?filterby[description]=x' });

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
	});
});

describe('GET /api/plugins/count', () => {
	it('counts all the plugins', async () => {
		const { body } = await callApi({ path: '/plugins/count' });

		expect(body).toEqual({ msg: MESSAGES.pluginsCount, data: 50 });
	});

	it('counts the plugins whose name holds the text', async () => {
		const { body } = await callApi({ path: '/plugins/count?name=GX' });
		const expected = plugins.filter(plugin => plugin.name.toLowerCase().includes('gx'));

		expect(body.data).toBe(expected.length);
	});

	it.each([
		[200, 48],
		[400, 49]
	])('answers %i to a name of %i letters', async (expected, length) => {
		const { status } = await callApi({ path: `/plugins/count?name=${'a'.repeat(length)}` });

		expect(status).toBe(expected);
	});

	it('answers 400 to a repeated name', async () => {
		const { status } = await callApi({ path: '/plugins/count?name=a&name=b' });

		expect(status).toBe(400);
	});
});

describe('GET /api/plugin/:id', () => {
	it('serves each seed plugin as data/plugins.json holds it', async () => {
		const responses = await Promise.all(plugins.map(plugin => callApi({ path: `/plugin/${toPluginId(plugin.name)}` })));

		responses.forEach(({ status, body }, index) => {
			expect(status).toBe(200);
			expect(body).toEqual({
				msg: MESSAGES.pluginFound,
				data: { _id: toPluginId(plugins[index].name), ...plugins[index] }
			});
		});
	});

	it('answers 404 to an unknown id', async () => {
		const { status, body } = await callApi({ path: '/plugin/unknown' });

		expect(status).toBe(404);
		expect(body).toEqual({ msg: MESSAGES.pluginNotFound });
	});

	it('answers 400 to a malformed id', async () => {
		const { status, body } = await callApi({ path: '/plugin/%E0' });

		expect(status).toBe(400);
		expect(body).toEqual({ msg: MESSAGES.invalidInput });
	});
});

describe('response headers', () => {
	it.each(['/plugins', '/plugins/count', '/plugin/abgate'])('lets a browser cache %s for a minute', async path => {
		const { status, headers } = await callApi({ path });

		expect(status).toBe(200);
		expect(headers.get('Cache-Control')).toBe('public, max-age=60');
		expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
	});

	it.each([
		['GET', '/plugin/unknown', 404],
		['GET', '/plugin/%E0', 400],
		['GET', '/plugins?filterby[nope]=x', 400],
		['GET', '/unknown', 404],
		['POST', '/plugin', 404]
	])('forbids caching %s %s, answered %i', async (method, path, expectedStatus) => {
		const { status, headers } = await callApi({ path, method });

		expect(status).toBe(expectedStatus);
		expect(headers.get('Cache-Control')).toBe('no-store');
		expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});

describe('routes outside the read API', () => {
	it.each([
		['POST', '/plugin'],
		['PUT', '/plugin/abgate'],
		['DELETE', '/plugin/abgate'],
		['GET', '/unknown']
	])('answers %s %s with a JSON 404, since the Worker serves the read routes only', async (method, path) => {
		const { status, body } = await callApi({ path, method });

		expect(status).toBe(404);
		expect(body).toEqual({ msg: MESSAGES.routeNotFound });
	});
});
