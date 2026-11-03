import express from 'express';

import { sendError, sendRouteNotFound, setApiHeaders, setCorsHeaders } from './middlewares.js';

/**
 * Builds the Express app of the API: the CORS and standard headers, the given routers on `/api`,
 * a JSON 404 and the JSON error responses.
 *
 * @param {...import('express').Router} routers - Routers of the API, such as createReadRouter(db).
 * @returns {import('express').Express} The app, ready to listen.
 */
export const createApp = (...routers) => {
	const app = express();
	app.disable('x-powered-by');
	app.use(setCorsHeaders);
	app.use(setApiHeaders);
	app.use('/api', ...routers);
	app.use(sendRouteNotFound);
	app.use(sendError);
	return app;
};
