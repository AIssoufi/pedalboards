// Serves the plugin images that the CMS uploads. Only the local entry (src/local.js) mounts it.
import { Router } from 'express';

import { MESSAGES, PLUGIN_IMAGE_ROUTE } from '../constants.js';
import { findPluginImage } from '../storage/images.js';

/** Type of an image whose type the bucket did not keep */
const UNKNOWN_IMAGE_TYPE = 'application/octet-stream';

/**
 * Builds the router that serves the plugin images: `GET /api/images/:id`.
 *
 * @param {R2Bucket} images - Bucket of the images.
 * @returns {import('express').Router} The router, to mount on `/api`.
 */
export const createImageRouter = images => {
	const router = Router();

	router.get(`${PLUGIN_IMAGE_ROUTE}/:id`, async (req, res) => {
		const image = await findPluginImage({ images, id: req.params.id });
		if (!image) {
			res.status(404).json({ msg: MESSAGES.imageNotFound });
			return;
		}
		// nosniff: the browser keeps the stored type and never runs an upload as a page
		res.set({
			'Content-Type': image.httpMetadata?.contentType ?? UNKNOWN_IMAGE_TYPE,
			'X-Content-Type-Options': 'nosniff'
		});
		res.send(Buffer.from(await image.arrayBuffer()));
	});

	return router;
};
