import { describe, expect, it } from 'vitest';

import { PLUGIN_FILTER_CONDITIONS } from '../constants.js';
import { buildPluginWhere, toPlugin } from './plugins.js';

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
