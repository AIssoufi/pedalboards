// Write routes of the CMS, kept for ticket #53. No runtime mounts them: the deployed Worker serves
// the read routes only, and #53 ports these routes to D1, with the images in R2, in a local
// environment. Never import this file from src/index.js.
import { Router } from 'express';

import { MESSAGES } from '../constants.js';
import { InvalidInputError } from '../errors.js';
import { parseFilters } from '../utils/filters.js';
import { countPages, parsePagination } from '../utils/pagination.js';

/**
 * Parses a JSON field of a form.
 *
 * @param {unknown} value - Value of the field.
 * @returns {unknown} The parsed value.
 * @throws {InvalidInputError} When the field is not valid JSON.
 */
export const parseJsonField = value => {
	try {
		return JSON.parse(value);
	} catch {
		throw new InvalidInputError('Invalid JSON field');
	}
};

/**
 * Reads the plugin of a create form. The image is in the request file, not in the plugin.
 *
 * @param {Record<string, string>} body - Text fields of the form.
 * @returns {Object} The plugin to create.
 * @throws {InvalidInputError} When a JSON field is invalid or the categories are missing.
 */
export const readPluginForm = body => {
	if (typeof body.categories !== 'string') {
		throw new InvalidInputError('Missing categories');
	}
	return {
		author: parseJsonField(body.author),
		brand: body.brand,
		categories: body.categories.trim().split(','),
		controlPorts: parseJsonField(body.controlPorts),
		description: body.description,
		label: body.label,
		name: body.name,
		pedalboardCount: body.pedalboardCount,
		uri: body.uri,
		version: body.version
	};
};

/**
 * Builds the router of the write routes: create, update and delete a plugin.
 *
 * @param {Object} params
 * @param {Object} params.store - Saves the plugins: `createPlugin({ plugin, image })`,
 *   `updatePlugin({ id, changes })` and `deletePlugin({ id, page, pageSize, filters })`, which
 *   gives the page that follows the deletion with `data`, `count` and `deletedCount`.
 * @param {Object} params.upload - Multipart parser with the multer API (`single`, `none`).
 * @returns {import('express').Router} The router, to mount on `/api`.
 */
export const createWriteRouter = ({ store, upload }) => {
	const router = Router();

	router.post('/plugin', upload.single('image'), async (req, res) => {
		const data = await store.createPlugin({ plugin: readPluginForm(req.body), image: req.file });
		res.status(201).json({ msg: MESSAGES.pluginCreated, data });
	});

	router.put('/plugin/:id', upload.none(), async (req, res) => {
		const data = await store.updatePlugin({ id: req.params.id, changes: req.body });
		res.json({ msg: MESSAGES.pluginUpdated, data });
	});

	// Deletes a plugin and gives the page of the list that the CMS shows after it
	router.delete('/plugin/:id', async (req, res) => {
		const { page, pageSize } = parsePagination(req.query);
		const filters = parseFilters(req.query);
		const { data, count, deletedCount } = await store.deletePlugin({ id: req.params.id, page, pageSize, filters });
		res.json({
			msg: MESSAGES.pluginDeleted,
			data,
			count,
			deletedCount,
			currentPage: page,
			numberPages: countPages({ count, pageSize })
		});
	});

	return router;
};
