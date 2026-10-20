import { Router } from 'express';

import { MESSAGES } from '../constants.js';
import { countPlugins, findPluginById, findPluginPage } from '../db/plugins.js';
import { parseFilters, parseSearchText } from '../utils/filters.js';
import { countPages, parsePagination } from '../utils/pagination.js';

/**
 * Builds the router of the read routes, the only ones that the deployed Worker serves.
 *
 * @param {D1Database} db - Database of the plugins.
 * @returns {import('express').Router} The router, to mount on `/api`.
 */
export const createReadRouter = db => {
	const router = Router();

	// Number of plugins whose name holds the `name` parameter
	router.get('/plugins/count', async (req, res) => {
		const name = parseSearchText(req.query.name);
		const count = await countPlugins({ db, filters: name ? { name } : {} });
		res.json({ msg: MESSAGES.pluginsCount, data: count });
	});

	// One page of the plugins, with the `page`, `pagesize` and `filterby[<field>]` parameters
	router.get('/plugins', async (req, res) => {
		const { page, pageSize } = parsePagination(req.query);
		const filters = parseFilters(req.query);
		const { data, count } = await findPluginPage({ db, page, pageSize, filters });
		res.json({
			msg: MESSAGES.pluginsFound,
			data,
			count,
			currentPage: page,
			numberPages: countPages({ count, pageSize })
		});
	});

	router.get('/plugin/:id', async (req, res) => {
		const plugin = await findPluginById({ db, id: req.params.id });
		if (!plugin) {
			res.status(404).json({ msg: MESSAGES.pluginNotFound });
			return;
		}
		res.json({ msg: MESSAGES.pluginFound, data: plugin });
	});

	return router;
};
