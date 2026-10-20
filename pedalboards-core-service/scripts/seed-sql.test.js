import { describe, expect, it } from 'vitest';

import { buildSeedSql, toPluginId, toSqlLiteral } from './seed-sql.js';

describe('toPluginId', () => {
	it('joins the lower case words with dashes', () => {
		expect(toPluginId('MDA Overdrive')).toBe('mda-overdrive');
		expect(toPluginId('Invada Stereo Phaser (sum L+R in)')).toBe('invada-stereo-phaser-sum-l-r-in');
	});

	it('drops the accents and the dashes at both ends', () => {
		expect(toPluginId(' Écho à lampes! ')).toBe('echo-a-lampes');
	});
});

describe('toSqlLiteral', () => {
	it('writes numbers, booleans and missing values as SQL literals', () => {
		expect(toSqlLiteral(0.5)).toBe('0.5');
		expect(toSqlLiteral(true)).toBe('1');
		expect(toSqlLiteral(false)).toBe('0');
		expect(toSqlLiteral(undefined)).toBe('NULL');
		expect(toSqlLiteral(null)).toBe('NULL');
	});

	it('quotes texts and doubles their quotes', () => {
		expect(toSqlLiteral("The Infamous Mindi's")).toBe("'The Infamous Mindi''s'");
	});

	it('writes objects and arrays as quoted JSON', () => {
		expect(toSqlLiteral({ name: "O'Neil" })).toBe(`'{"name":"O''Neil"}'`);
		expect(toSqlLiteral(['Delay', 'Echo'])).toBe(`'["Delay","Echo"]'`);
	});
});

describe('buildSeedSql', () => {
	it('writes one INSERT statement per plugin', () => {
		const sql = buildSeedSql([{ name: 'abGate', stable: true }, { name: 'MDA Overdrive', stable: false }]);
		const statements = sql.split('\n').filter(line => line.startsWith('INSERT'));

		expect(statements).toHaveLength(2);
		expect(statements[0]).toMatch(/^INSERT INTO plugins \(id, name, .*\) VALUES \('abgate', 'abGate', /);
		expect(sql.endsWith(';\n')).toBe(true);
	});

	it('refuses two plugins with the same id', () => {
		expect(() => buildSeedSql([{ name: 'Gx Booster' }, { name: 'gx-booster' }])).toThrow('gx-booster');
	});
});
