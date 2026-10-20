import { CORS_HEADERS, MESSAGES } from './constants.js';
import { DatabaseError, InvalidInputError } from './errors.js';

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
 * Answers 404 in JSON to a request that no route handled.
 *
 * @type {import('express').RequestHandler}
 */
export const sendRouteNotFound = (req, res) => {
	res.status(404).json({ msg: MESSAGES.routeNotFound });
};

/**
 * Answers a failed request with a short JSON message: 400 for an invalid parameter, 503 when the
 * database fails, 500 otherwise. The error itself is only logged, so a response never shows a stack.
 *
 * @type {import('express').ErrorRequestHandler}
 */
export const sendError = (error, req, res, next) => {
	// Express gives a 400 status to the errors of the request itself, such as a malformed URL
	const isInvalidInput = error instanceof InvalidInputError || error.status === 400;
	if (isInvalidInput) {
		res.status(400).json({ msg: MESSAGES.invalidInput });
		return;
	}
	console.error(`${req.method} ${req.originalUrl} failed:`, error);
	if (error instanceof DatabaseError) {
		res.status(503).json({ msg: MESSAGES.databaseError });
		return;
	}
	res.status(500).json({ msg: MESSAGES.internalError });
};
