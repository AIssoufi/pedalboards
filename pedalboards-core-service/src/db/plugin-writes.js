// Write queries of the CMS routes. Only the local entry (src/local.js) imports them: the deployed
// Worker never ships them (`pnpm check:bundle` checks it).
import { PLUGIN_JSON_COLUMNS, PLUGIN_WRITABLE_COLUMNS } from '../constants.js';
import { queryDatabase } from './plugins.js';

/**
 * Tells whether a field of a plugin goes into its column: a writable column, with a value.
 *
 * @param {[string, unknown]} entry - Name and value of the field.
 * @returns {boolean} True when the field is written.
 */
const isWritableField = ([column, value]) => {
	const isWritableColumn = PLUGIN_WRITABLE_COLUMNS.includes(column);
	return isWritableColumn && value !== undefined;
};

/**
 * Gives the value of a column as D1 stores it: JSON text for a JSON column, the value itself otherwise.
 *
 * @param {[string, unknown]} entry - Column and value.
 * @returns {[string, unknown]} The column and its stored value.
 */
const toStoredValue = ([column, value]) => {
	const isJsonColumn = PLUGIN_JSON_COLUMNS.includes(column);
	return [column, isJsonColumn ? JSON.stringify(value) : value];
};

/**
 * Turns the fields of a plugin into the values of its writable columns: the JSON columns become
 * JSON text, and the other fields and the missing values are left out.
 *
 * @param {Record<string, unknown>} fields - Fields of the plugin, such as `{ name, categories }`.
 * @returns {[string, unknown][]} The column and the value of each writable field, in the order of the fields.
 * @example
 * toColumnValues({ name: 'Gate', categories: ['Dynamics'], stable: true });
 * // [['name', 'Gate'], ['categories', '["Dynamics"]']]
 */
export const toColumnValues = fields => Object.entries(fields ?? {}).filter(isWritableField).map(toStoredValue);

/**
 * Inserts a plugin, unless a plugin already has its id.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {Record<string, unknown>} params.plugin - Plugin with its `id`; the columns it leaves out take their default.
 * @returns {Promise<boolean>} True when the plugin is inserted, false when its id is taken.
 */
export const insertPlugin = ({ db, plugin: { id, ...fields } }) => queryDatabase(async () => {
	const columnValues = toColumnValues(fields);
	const columns = ['id', ...columnValues.map(([column]) => column)];
	const placeholders = columns.map(() => '?').join(', ');
	const { meta } = await db
		.prepare(`INSERT INTO plugins (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`)
		.bind(id, ...columnValues.map(([, value]) => value))
		.run();
	return meta.changes > 0;
});

/**
 * Changes some fields of a plugin and keeps the others.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {string} params.id - Id of the plugin.
 * @param {Record<string, unknown>} params.changes - New value of each changed field; at least one writable field.
 * @returns {Promise<boolean>} True when the plugin is updated, false when no plugin has this id.
 * @throws {TypeError} When the changes hold no writable field, which would make an invalid query.
 */
export const updatePlugin = async ({ db, id, changes }) => {
	const columnValues = toColumnValues(changes);
	if (!columnValues.length) {
		throw new TypeError('No writable field to update');
	}
	const assignments = columnValues.map(([column]) => `${column} = ?`).join(', ');
	return queryDatabase(async () => {
		const { meta } = await db
			.prepare(`UPDATE plugins SET ${assignments} WHERE id = ?`)
			.bind(...columnValues.map(([, value]) => value), id)
			.run();
		return meta.changes > 0;
	});
};

/**
 * Deletes a plugin.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {string} params.id - Id of the plugin.
 * @returns {Promise<number>} The number of deleted plugins: 1, or 0 when no plugin has this id.
 */
export const deletePlugin = ({ db, id }) => queryDatabase(async () => {
	const { meta } = await db.prepare('DELETE FROM plugins WHERE id = ?').bind(id).run();
	return meta.changes;
});
