// App of the local API (src/local.js): the write routes of the CMS beside the read routes. The
// deployed Worker (src/index.js) never imports this file (`pnpm check:bundle` checks it).
import { createApp } from './app.js';
import { createImageRouter } from './routes/images.js';
import { createReadRouter } from './routes/read.js';
import { createWriteRouter } from './routes/write.js';

/**
 * Builds the app of the local API, with the read, write and image routes.
 *
 * The write router comes first: Express answers an OPTIONS request in the first router whose
 * route matches the path, and the read router would answer the preflight of the CMS with GET only.
 *
 * @param {Object} params
 * @param {D1Database} params.db - Database of the plugins.
 * @param {R2Bucket} params.images - Bucket of the plugin images.
 * @returns {import('express').Express} The app, ready to listen.
 */
export const createLocalApp = ({ db, images }) => createApp(
	createWriteRouter({ db, images }),
	createReadRouter(db),
	createImageRouter(images)
);
