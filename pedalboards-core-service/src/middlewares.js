import { API_HEADERS, CORS_HEADERS, MESSAGES, READ_CACHE_CONTROL } from './constants.js';
import { ConflictError, DatabaseError, InvalidInputError } from './errors.js';

/** Lowest HTTP status that is not a success */
const FIRST_NON_SUCCESS_STATUS = 300;

/** Methods whose successful responses a browser may cache */
const READ_METHODS = ['GET', 'HEAD'];

/**
 * Adds the CORS headers to every response.
 *
 * @type {import('express').RequestHandler}
 */
export const setCorsHeaders = (req, res, next) => {
	res.set(CORS_HEADERS);
	next();
};

/**
 * Adds the standard headers of the API to every response: `nosniff`, and `no-store`, which the
 * read routes replace on success with setReadCacheHeaders.
 *
 * @type {import('express').RequestHandler}
 */
export const setApiHeaders = (req, res, next) => {
	res.set(API_HEADERS);
	next();
};

/**
 * Lets a browser cache the successful GET and HEAD responses of a read router for a short time;
 * any other method or status keeps `no-store`, whatever the order of the routers.
 *
 * @type {import('express').RequestHandler}
 */
export const setReadCacheHeaders = (req, res, next) => {
	const isRead = READ_METHODS.includes(req.method);
	if (!isRead) {
		next();
		return;
	}
	const sendJson = res.json.bind(res);
	res.json = body => {
		const isSuccess = res.statusCode < FIRST_NON_SUCCESS_STATUS;
		if (isSuccess) {
			res.set('Cache-Control', READ_CACHE_CONTROL);
		}
		return sendJson(body);
	};
	next();
};

/**
 * Answers 404 in JSON to a request that no route handled.
 *
 * @type {import('express').RequestHandler}
 */
export const sendRouteNotFound = (req, res) => {
	res.status(404).json({ msg: MESSAGES.routeNotFound });
};

/**
 * Answers a failed request with a short JSON message: 400 for an invalid parameter, 409 for a
 * plugin that already exists, 503 when the database fails, 500 otherwise. The unexpected errors
 * are only logged, so a response never shows a stack.
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars -- Express needs four arguments on an error handler
export const sendError = (error, req, res, next) => {
	// Express gives a 400 status to the errors of the request itself, such as a malformed URL
	const isInvalidInput = error instanceof InvalidInputError || error.status === 400;
	if (isInvalidInput) {
		res.status(400).json({ msg: MESSAGES.invalidInput });
		return;
	}
	if (error instanceof ConflictError) {
		res.status(409).json({ msg: MESSAGES.pluginExists });
		return;
	}
	console.error(`${req.method} ${req.originalUrl} failed:`, error);
	if (error instanceof DatabaseError) {
		res.status(503).json({ msg: MESSAGES.databaseError });
		return;
	}
	res.status(500).json({ msg: MESSAGES.internalError });
};
