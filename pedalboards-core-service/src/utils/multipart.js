// Reads the multipart forms of the CMS. Only the write routes use it, so the deployed Worker never
// ships it (`pnpm check:bundle` checks it).
import express from 'express';

import { CLIENT_ERROR_STATUS, MAX_FORM_BYTES } from '../constants.js';
import { InvalidInputError } from '../errors.js';

/** Reads the bytes of a multipart body into `req.body`, and leaves the other bodies unread */
const readFormBytes = express.raw({ type: 'multipart/form-data', limit: MAX_FORM_BYTES });

/**
 * Splits the entries of a form into its text fields and its files. A repeated name keeps its
 * last value.
 *
 * @param {FormData} form - Parsed form.
 * @returns {{ fields: Record<string, string>, files: Record<string, File> }} The text fields and the files, by name.
 * @example
 * const form = new FormData();
 * form.append('name', 'Gate');
 * form.append('image', new File(['…'], 'gate.png', { type: 'image/png' }));
 * splitFormEntries(form);
 * // { fields: { name: 'Gate' }, files: { image: File } }
 */
export const splitFormEntries = form => {
	const fields = {};
	const files = {};
	for (const [name, value] of form.entries()) {
		if (typeof value === 'string') {
			fields[name] = value;
		} else {
			files[name] = value;
		}
	}
	return { fields, files };
};

/**
 * Tells whether body-parser refused the body itself (too large, aborted, unknown encoding), as
 * opposed to a failure of the server.
 *
 * @param {unknown} error - Error given by body-parser.
 * @returns {boolean} True for a client error.
 */
export const isBadBodyError = error => error?.status >= CLIENT_ERROR_STATUS.min && error?.status <= CLIENT_ERROR_STATUS.max;

/**
 * Reads a multipart/form-data body, as the CMS sends it, into `req.body` (the text fields) and
 * `req.files` (the files, as File objects). Another body leaves both empty.
 *
 * @type {import('express').RequestHandler}
 * @throws {InvalidInputError} Through `next`, when the body is malformed or larger than MAX_FORM_BYTES.
 */
export const parseMultipartForm = (req, res, next) => {
	readFormBytes(req, res, async error => {
		if (error) {
			next(isBadBodyError(error) ? new InvalidInputError('Unreadable form', { cause: error }) : error);
			return;
		}
		const isMultipart = Buffer.isBuffer(req.body);
		if (!isMultipart) {
			req.body = {};
			req.files = {};
			next();
			return;
		}
		let form;
		try {
			form = await new Response(req.body, { headers: { 'Content-Type': req.get('Content-Type') } }).formData();
		} catch (cause) {
			next(new InvalidInputError('Malformed multipart form', { cause }));
			return;
		}
		const { fields, files } = splitFormEntries(form);
		req.body = fields;
		req.files = files;
		next();
	});
};
