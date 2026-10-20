import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DatabaseError } from '../errors.js';
import { deletePlugin, insertPlugin, toColumnValues, updatePlugin } from './plugin-writes.js';
import { countPlugins, findPluginById } from './plugins.js';

const { DB: db } = env;

// Plugin that each test starts with. The tests share the local D1, so each one cleans up after itself
const FIXTURE = { id: 'fixture-plugin', name: 'Fixture Plugin', label: 'Fixture', categories: ['Delay'] };

const NEW_PLUGIN = {
	id: 'new-gate',
	name: 'New Gate',
	label: 'Gate',
	categories: ['Dynamics'],
	author: { name: 'Me' },
	controlPorts: [{ name: 'Threshold', min: 0, max: 1, default: 0.5 }],
	pedalboardCount: 3
};

const brokenDb = {
	prepare: () => {
		throw new Error('D1_ERROR: no such table: plugins');
	}
};

beforeEach(async () => {
	await insertPlugin({ db, plugin: FIXTURE });
});

afterEach(async () => {
	await db.prepare('DELETE FROM plugins WHERE id IN (?, ?)').bind(FIXTURE.id, NEW_PLUGIN.id).run();
});

describe('toColumnValues', () => {
	it('writes the JSON columns as JSON text and keeps the other values', () => {
		expect(toColumnValues({ name: 'Gate', categories: ['Dynamics'], pedalboardCount: 2 })).toEqual([
			['name', 'Gate'],
			['categories', '["Dynamics"]'],
			['pedalboardCount', 2]
		]);
	});

	it('leaves out the fields that are not writable columns and the missing values', () => {
		expect(toColumnValues({ id: 'x', stable: true, 'name = name; --': 'x', label: undefined, brand: '' })).toEqual([['brand', '']]);
	});

	it.each([undefined, null, {}])('gives no column for %j', fields => {
		expect(toColumnValues(fields)).toEqual([]);
	});
});

describe('insertPlugin', () => {
	it('inserts a plugin, with the defaults of the columns it leaves out', async () => {
		expect(await insertPlugin({ db, plugin: NEW_PLUGIN })).toBe(true);

		expect(await findPluginById({ db, id: NEW_PLUGIN.id })).toEqual({
			_id: 'new-gate',
			name: 'New Gate',
			label: 'Gate',
			brand: '',
			description: '',
			uri: '',
			version: '',
			stable: false,
			pedalboardCount: 3,
			screenshotUrl: '',
			thumbnailUrl: '',
			imageWidth: null,
			imageHeight: null,
			author: { name: 'Me' },
			categories: ['Dynamics'],
			controlPorts: [{ name: 'Threshold', min: 0, max: 1, default: 0.5 }]
		});
	});

	it('inserts nothing when the id is taken', async () => {
		const fixturePlugin = await findPluginById({ db, id: FIXTURE.id });

		expect(await insertPlugin({ db, plugin: { id: FIXTURE.id, name: 'Other' } })).toBe(false);
		expect(await findPluginById({ db, id: FIXTURE.id })).toEqual(fixturePlugin);
	});

	it('raises a DatabaseError when D1 fails', async () => {
		await expect(insertPlugin({ db: brokenDb, plugin: NEW_PLUGIN })).rejects.toThrow(DatabaseError);
	});
});

describe('updatePlugin', () => {
	it('changes the given fields and keeps the others', async () => {
		const fixturePlugin = await findPluginById({ db, id: FIXTURE.id });

		expect(await updatePlugin({ db, id: FIXTURE.id, changes: { label: 'Drive', categories: ['Distortion', 'Fuzz'] } })).toBe(true);
		expect(await findPluginById({ db, id: FIXTURE.id })).toEqual({ ...fixturePlugin, label: 'Drive', categories: ['Distortion', 'Fuzz'] });
	});

	it('updates nothing when no plugin has the id', async () => {
		expect(await updatePlugin({ db, id: 'unknown', changes: { label: 'Drive' } })).toBe(false);
	});

	it('refuses changes without a writable field', async () => {
		await expect(updatePlugin({ db, id: FIXTURE.id, changes: { id: 'other', stable: true } })).rejects.toThrow(TypeError);
	});

	it('raises a DatabaseError when D1 fails', async () => {
		await expect(updatePlugin({ db: brokenDb, id: FIXTURE.id, changes: { label: 'Drive' } })).rejects.toThrow(DatabaseError);
	});
});

describe('deletePlugin', () => {
	it('deletes a plugin and counts it', async () => {
		const countBefore = await countPlugins({ db, filters: {} });

		expect(await deletePlugin({ db, id: FIXTURE.id })).toBe(1);
		expect(await findPluginById({ db, id: FIXTURE.id })).toBeNull();
		expect(await countPlugins({ db, filters: {} })).toBe(countBefore - 1);
	});

	it('counts 0 when no plugin has the id', async () => {
		expect(await deletePlugin({ db, id: 'unknown' })).toBe(0);
	});

	it('raises a DatabaseError when D1 fails', async () => {
		await expect(deletePlugin({ db: brokenDb, id: FIXTURE.id })).rejects.toThrow(DatabaseError);
	});
});
