// Write routes of the CMS, on D1 with the images in R2. Only the local entry (src/local.js) mounts
// them: the deployed Worker serves the read routes only. Never import this file from src/index.js
// (`pnpm check:bundle` checks it).
import { Router } from 'express';

import { MESSAGES, WRITE_CORS_METHODS } from '../constants.js';
import { deletePlugin, insertPlugin, updatePlugin } from '../db/plugin-writes.js';
import { findPluginById, findPluginPage } from '../db/plugins.js';
import { ConflictError, InvalidInputError } from '../errors.js';
import { deletePluginImage, savePluginImage, toImageUrl } from '../storage/images.js';
import { parseFilters } from '../utils/filters.js';
import { parseMultipartForm } from '../utils/multipart.js';
import { countPages, parsePagination } from '../utils/pagination.js';
import { readPluginChanges, readPluginForm, readPluginImage } from '../utils/plugin-form.js';

/**
 * Lets the CMS, on another origin, send its PUT and DELETE requests: the browser asks first with
 * an OPTIONS request, answered here.
 *
 * @type {import('express').RequestHandler}
 */
const allowWriteMethods = (req, res, next) => {
	res.set('Access-Control-Allow-Methods', WRITE_CORS_METHODS);
	if (req.method === 'OPTIONS') {
		res.sendStatus(204);
		return;
	}
	next();
};

/**
 * Gives the address of the image of a plugin, on the origin that the request called.
 *
 * @param {Object} params
 * @param {import('express').Request} params.req - Request that uploads the image.
 * @param {string} params.id - Id of the plugin.
 * @returns {string} The address of the image, with the upload time as its version.
 */
const toUploadedImageUrl = ({ req, id }) => toImageUrl({ origin: `${req.protocol}://${req.get('host')}`, id, version: Date.now() });

/**
 * Builds the router of the write routes: create, update and delete a plugin.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {R2Bucket} params.images - Bucket of the plugin images.
 * @returns {import('express').Router} The router, to mount on `/api`.
 */
export const createWriteRouter = ({ db, images }) => {
	const router = Router();
	router.use(allowWriteMethods);

	// Creates a plugin from a multipart form, with an optional `image` file
	router.post('/plugin', parseMultipartForm, async (req, res) => {
		const plugin = readPluginForm(req.body);
		const image = readPluginImage(req.files.image);
		const screenshotUrl = image ? toUploadedImageUrl({ req, id: plugin.id }) : undefined;
		const isCreated = await insertPlugin({ db, plugin: { ...plugin, screenshotUrl } });
		if (!isCreated) {
			throw new ConflictError(`The id ${plugin.id} is taken`);
		}
		if (image) {
			await savePluginImage({ images, id: plugin.id, image });
		}
		res.status(201).json({ msg: MESSAGES.pluginCreated, data: await findPluginById({ db, id: plugin.id }) });
	});

	// Changes the fields that the form gives, and the image when it has one; keeps the others
	router.put('/plugin/:id', parseMultipartForm, async (req, res) => {
		const { id } = req.params;
		const image = readPluginImage(req.files.image);
		const changes = readPluginChanges(req.body);
		if (image) {
			changes.screenshotUrl = toUploadedImageUrl({ req, id });
		}
		const hasChanges = Object.keys(changes).length > 0;
		if (!hasChanges) {
			throw new InvalidInputError('Nothing to update');
		}
		const isUpdated = await updatePlugin({ db, id, changes });
		if (!isUpdated) {
			res.status(404).json({ msg: MESSAGES.pluginNotFound });
			return;
		}
		if (image) {
			await savePluginImage({ images, id, image });
		}
		res.json({ msg: MESSAGES.pluginUpdated, data: await findPluginById({ db, id }) });
	});

	// Deletes a plugin and its image, and gives the page of the list that the CMS shows after it
	router.delete('/plugin/:id', async (req, res) => {
		const { id } = req.params;
		const { page, pageSize } = parsePagination(req.query);
		const filters = parseFilters(req.query);
		const deletedCount = await deletePlugin({ db, id });
		await deletePluginImage({ images, id });
		const { data, count } = await findPluginPage({ db, page, pageSize, filters });
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
