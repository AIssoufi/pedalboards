import { PLUGIN_FILTER_CONDITIONS, PLUGIN_ORDER_BY } from '../constants.js';
import { DatabaseError } from '../errors.js';
import { escapeLikePattern } from '../utils/filters.js';

/**
 * Builds the WHERE clause of a plugin search: a plugin matches when one of the filtered fields
 * contains its searched text, whatever the case of ASCII letters.
 *
 * @param {Record<string, string>} filters - Searched text of each field, read by parseFilters.
 * @returns {{ clause: string, params: string[] }} The clause, empty without filters, and its bound LIKE patterns.
 * @example
 * buildPluginWhere({ brand: 'mda' });
 * // { clause: "WHERE brand LIKE ? ESCAPE '\\'", params: ['%mda%'] }
 */
export const buildPluginWhere = filters => {
	const entries = Object.entries(filters);
	if (!entries.length) {
		return { clause: '', params: [] };
	}
	const conditions = entries.map(([field]) => PLUGIN_FILTER_CONDITIONS[field]);
	return {
		clause: `WHERE ${conditions.join(' OR ')}`,
		params: entries.map(([, text]) => `%${escapeLikePattern(text)}%`)
	};
};

/**
 * Turns a row of the plugins table into the plugin that the API returns.
 *
 * @param {Record<string, unknown>} row - Row read from D1.
 * @returns {Record<string, unknown>} The plugin, with its id in `_id` and its JSON columns parsed.
 */
export const toPlugin = ({ id, author, categories, controlPorts, stable, ...fields }) => ({
	_id: id,
	...fields,
	author: JSON.parse(author),
	categories: JSON.parse(categories),
	controlPorts: JSON.parse(controlPorts),
	stable: Boolean(stable)
});

/**
 * Runs D1 queries, turning their failure into a DatabaseError.
 *
 * @template T
 * @param {() => Promise<T>} runQueries - Function that queries D1.
 * @returns {Promise<T>} The result of the queries.
 * @throws {DatabaseError} When D1 fails.
 */
const queryDatabase = async runQueries => {
	try {
		return await runQueries();
	} catch (error) {
		throw new DatabaseError('D1 query failed', { cause: error });
	}
};

/**
 * Reads one page of the plugins matching the filters, sorted by name across all the pages.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {number} params.page - Page, from 1.
 * @param {number} params.pageSize - Number of plugins per page.
 * @param {Record<string, string>} params.filters - Searched text of each field.
 * @returns {Promise<{ data: Object[], count: number }>} The plugins of the page and the number of matching plugins.
 */
export const findPluginPage = ({ db, page, pageSize, filters }) => queryDatabase(async () => {
	const { clause, params } = buildPluginWhere(filters);
	const [countResult, pageResult] = await db.batch([
		db.prepare(`SELECT COUNT(*) AS count FROM plugins ${clause}`).bind(...params),
		db.prepare(`SELECT * FROM plugins ${clause} ${PLUGIN_ORDER_BY} LIMIT ? OFFSET ?`)
			.bind(...params, pageSize, (page - 1) * pageSize)
	]);
	return { data: pageResult.results.map(toPlugin), count: countResult.results[0].count };
});

/**
 * Counts the plugins matching the filters.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {Record<string, string>} params.filters - Searched text of each field.
 * @returns {Promise<number>} The number of matching plugins.
 */
export const countPlugins = ({ db, filters }) => queryDatabase(async () => {
	const { clause, params } = buildPluginWhere(filters);
	return db.prepare(`SELECT COUNT(*) AS count FROM plugins ${clause}`).bind(...params).first('count');
});

/**
 * Reads one plugin.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {string} params.id - Id of the plugin.
 * @returns {Promise<Object | null>} The plugin, or null when no plugin has this id.
 */
export const findPluginById = ({ db, id }) => queryDatabase(async () => {
	const row = await db.prepare('SELECT * FROM plugins WHERE id = ?').bind(id).first();
	return row && toPlugin(row);
});
