import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PLUGIN_FILTER_CONDITIONS, PLUGIN_ORDER_BY } from '../constants.js';
import { insertPlugin } from './plugin-writes.js';
import { buildPluginWhere, findPluginPage, toPlugin } from './plugins.js';

const { DB: db } = env;

// Same label whatever the case, and no ASCII order between the ids and the case. The tests share the
// local D1, so they remove these plugins afterwards
const TIED_PLUGINS = [
	{ id: 'tied-c', name: 'Tied C', label: 'Tied Label' },
	{ id: 'tied-a', name: 'Tied A', label: 'TIED LABEL' },
	{ id: 'tied-b', name: 'Tied B', label: 'tied label' }
];
const TIED_IDS_IN_ORDER = ['tied-a', 'tied-b', 'tied-c'];
const TIED_FILTERS = { label: 'tied label' };
const NO_LABEL_PLUGIN = { id: 'no-label', name: 'No Label' };
const NO_LABEL_FILTERS = { name: 'No Label' };
const TEST_PLUGINS = [...TIED_PLUGINS, NO_LABEL_PLUGIN];

describe('buildPluginWhere', () => {
	it('gives no clause without filters', () => {
		expect(buildPluginWhere({})).toEqual({ clause: '', params: [] });
	});

	it('joins the conditions of the filtered fields with OR, in the order of their patterns', () => {
		expect(buildPluginWhere({ brand: 'mda', categories: 'Delay' })).toEqual({
			clause: `WHERE ${PLUGIN_FILTER_CONDITIONS.brand} OR ${PLUGIN_FILTER_CONDITIONS.categories}`,
			params: ['%mda%', '%Delay%']
		});
	});

	it('binds the searched text as an escaped pattern, never in the SQL', () => {
		const { clause, params } = buildPluginWhere({ name: "50%' OR 1=1 --" });

		expect(clause).not.toContain('OR 1=1');
		expect(params).toEqual(["%50\\%' OR 1=1 --%"]);
	});
});

describe('toPlugin', () => {
	it('gives the id as _id, parses the JSON columns and turns stable into a boolean', () => {
		const row = {
			id: 'mda-overdrive',
			name: 'MDA Overdrive',
			stable: 1,
			author: '{"name":"MDA"}',
			categories: '["Distortion"]',
			controlPorts: '[{"name":"Drive","min":0,"max":1,"default":0}]'
		};

		expect(toPlugin(row)).toEqual({
			_id: 'mda-overdrive',
			name: 'MDA Overdrive',
			stable: true,
			author: { name: 'MDA' },
			categories: ['Distortion'],
			controlPorts: [{ name: 'Drive', min: 0, max: 1, default: 0 }]
		});
	});

	it('turns a stable column of 0 into false', () => {
		const row = { id: 'a', stable: 0, author: '{}', categories: '[]', controlPorts: '[]' };

		expect(toPlugin(row).stable).toBe(false);
	});
});

describe('findPluginPage', () => {
	beforeEach(async () => {
		await Promise.all(TEST_PLUGINS.map(plugin => insertPlugin({ db, plugin })));
	});

	afterEach(async () => {
		const ids = TEST_PLUGINS.map(plugin => plugin.id);
		await db.prepare(`DELETE FROM plugins WHERE id IN (${ids.map(() => '?').join(', ')})`).bind(...ids).run();
	});

	it('orders labels that only differ by their case by id, so the pages neither overlap nor skip one', async () => {
		const pages = await Promise.all(TIED_IDS_IN_ORDER.map((_, index) => findPluginPage({
			db,
			page: index + 1,
			pageSize: 1,
			filters: TIED_FILTERS
		})));

		expect(pages.flatMap(({ data }) => data.map(plugin => plugin._id))).toEqual(TIED_IDS_IN_ORDER);
		pages.forEach(({ count }) => expect(count).toBe(TIED_IDS_IN_ORDER.length));
	});

	it('answers an empty page after the last one', async () => {
		const { data, count } = await findPluginPage({
			db,
			page: TIED_IDS_IN_ORDER.length + 1,
			pageSize: 1,
			filters: TIED_FILTERS
		});

		expect(data).toEqual([]);
		expect(count).toBe(TIED_IDS_IN_ORDER.length);
	});

	it('puts a plugin without a label first, since its empty label comes before any other', async () => {
		const { data: [first] } = await findPluginPage({ db, page: 1, pageSize: 1, filters: {} });
		const { data: found } = await findPluginPage({ db, page: 1, pageSize: 1, filters: NO_LABEL_FILTERS });

		expect(first._id).toBe(NO_LABEL_PLUGIN.id);
		expect(found.map(plugin => plugin.label)).toEqual(['']);
	});
});

describe('the order of the plugin lists', () => {
	it('reads the index of the labels instead of sorting the table', async () => {
		const { results } = await db.prepare(`EXPLAIN QUERY PLAN SELECT * FROM plugins ${PLUGIN_ORDER_BY} LIMIT 10`).all();
		const plan = results.map(step => step.detail).join('\n');

		expect(plan).toContain('plugins_by_label');
		expect(plan).not.toContain('TEMP B-TREE');
	});
});
