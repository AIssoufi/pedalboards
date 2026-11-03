import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

import plugins from '../data/plugins.json';
import { toPluginId } from '../src/utils/plugin-id.js';

const { DB: db, TEST_MIGRATIONS: migrations } = env;

const WOV_SIZE_MIGRATION = '0004_correct_wov_image_size.sql';
const WOV_ID = 'wov';
const UNKNOWN_MIGRATION = '9999_unknown.sql';

// The size that the first seed stored for wov, which the deployed database still held
const FIRST_SEED_WOV_SIZE = { imageWidth: 400, imageHeight: 368 };

const SELECT_SIZES = 'SELECT id, imageWidth, imageHeight FROM plugins ORDER BY id';

/**
 * Runs the statements of a migration after the given statements, then reads every size, in one
 * D1 batch: a batch is a transaction, so the other test files never see the rows in between.
 *
 * @param {Object} params
 * @param {string} params.migrationName - File name of the migration, such as `0004_name.sql`.
 * @param {D1PreparedStatement[]} [params.before] - Statements that set the rows up.
 * @returns {Promise<{ before: Object[], after: Object[] }>} The sizes before and after the migration.
 * @throws {Error} When no migration has that name.
 */
const runMigration = async ({ migrationName, before = [] }) => {
	const migration = migrations.find(({ name }) => name === migrationName);
	if (migration === undefined) {
		throw new Error(`No migration is named ${migrationName}`);
	}
	const results = await db.batch([
		...before,
		db.prepare(SELECT_SIZES),
		...migration.queries.map(query => db.prepare(query)),
		db.prepare(SELECT_SIZES)
	]);
	return { before: results[before.length].results, after: results.at(-1).results };
};

const findWov = rows => rows.find(({ id }) => id === WOV_ID);
const withoutWov = rows => rows.filter(({ id }) => id !== WOV_ID);

describe(WOV_SIZE_MIGRATION, () => {
	const wovPlugin = plugins.find(plugin => toPluginId(plugin.name) === WOV_ID);
	const wovSize = { imageWidth: wovPlugin.imageWidth, imageHeight: wovPlugin.imageHeight };

	it('gives wov the size of its screenshot on a database seeded with the first size', async () => {
		const setFirstSeedSize = db
			.prepare('UPDATE plugins SET imageWidth = ?, imageHeight = ? WHERE id = ?')
			.bind(FIRST_SEED_WOV_SIZE.imageWidth, FIRST_SEED_WOV_SIZE.imageHeight, WOV_ID);

		const { before, after } = await runMigration({ migrationName: WOV_SIZE_MIGRATION, before: [setFirstSeedSize] });

		expect(findWov(before)).toEqual({ id: WOV_ID, ...FIRST_SEED_WOV_SIZE });
		expect(findWov(after)).toEqual({ id: WOV_ID, ...wovSize });
		expect(withoutWov(after)).toEqual(withoutWov(before));
	});

	it('changes nothing on a database seeded since the correction', async () => {
		const { before, after } = await runMigration({ migrationName: WOV_SIZE_MIGRATION });

		expect(findWov(before)).toEqual({ id: WOV_ID, ...wovSize });
		expect(after).toEqual(before);
	});

	it('refuses a migration name that does not exist', async () => {
		await expect(runMigration({ migrationName: UNKNOWN_MIGRATION })).rejects.toThrow(UNKNOWN_MIGRATION);
	});
});
