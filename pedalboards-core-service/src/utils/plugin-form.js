// Reads the plugin forms of the CMS. Only the write routes use it, so the deployed Worker never
// ships it.
import { MAX_PLUGIN_IMAGE_BYTES, PLUGIN_IMAGE_TYPES, POSITIVE_INTEGER_PATTERN } from '../constants.js';
import { InvalidInputError } from '../errors.js';
import { toPluginId } from './plugin-id.js';

/**
 * Parses a JSON field of a form.
 *
 * @param {string} value - Value of the field.
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
 * Tells whether a value is an object with fields, neither null nor an array.
 *
 * @param {unknown} value - Parsed JSON value.
 * @returns {boolean} True for an object such as `{ "name": "MDA" }`.
 */
const isPlainObject = value => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Parses the author field: a JSON object, such as `{ "name": "MDA" }`.
 *
 * @param {string} value - Value of the field.
 * @returns {Record<string, unknown>} The author.
 * @throws {InvalidInputError} When the field is not a JSON object.
 */
export const parseAuthor = value => {
	const author = parseJsonField(value);
	if (!isPlainObject(author)) {
		throw new InvalidInputError('The author is not an object');
	}
	return author;
};

/**
 * Parses the controlPorts field: a JSON array of objects, such as `[{ "name": "Drive" }]`.
 *
 * @param {string} value - Value of the field.
 * @returns {Record<string, unknown>[]} The control ports.
 * @throws {InvalidInputError} When the field is not a JSON array of objects.
 */
export const parseControlPorts = value => {
	const controlPorts = parseJsonField(value);
	const isPortList = Array.isArray(controlPorts) && controlPorts.every(isPlainObject);
	if (!isPortList) {
		throw new InvalidInputError('The control ports are not a list of objects');
	}
	return controlPorts;
};

/**
 * Parses the categories field: names separated by commas.
 *
 * @param {string} value - Value of the field, such as `Distortion, Simulator`.
 * @returns {string[]} The trimmed names, without empty ones, such as `['Distortion', 'Simulator']`.
 */
export const parseCategories = value => value
	.split(',')
	.map(category => category.trim())
	.filter(Boolean);

/**
 * Parses a count field: digits only.
 *
 * @param {string} value - Value of the field, such as `12`.
 * @returns {number} The count.
 * @throws {InvalidInputError} When the field is not a whole number of at least 0 that JavaScript holds exactly.
 */
export const parseCount = value => {
	const isCount = POSITIVE_INTEGER_PATTERN.test(value) && Number.isSafeInteger(Number(value));
	if (!isCount) {
		throw new InvalidInputError('Invalid count');
	}
	return Number(value);
};

/**
 * Trims a text field.
 *
 * @param {string} value - Value of the field.
 * @returns {string} The value without spaces at both ends.
 */
const parseText = value => value.trim();

/** Parser of each field of the form that the API saves; the other fields are ignored */
const FIELD_PARSERS = {
	name: parseText,
	label: parseText,
	brand: parseText,
	description: parseText,
	uri: parseText,
	version: parseText,
	pedalboardCount: parseCount,
	categories: parseCategories,
	author: parseAuthor,
	controlPorts: parseControlPorts
};

/**
 * Reads the fields that a form gives, for an update: the fields it leaves out keep their value.
 *
 * @param {Record<string, unknown>} body - Text fields of the form.
 * @returns {Record<string, unknown>} The parsed value of each saved field that the form gives.
 * @throws {InvalidInputError} When a field is invalid, or the name has no letter nor digit to make an id from.
 * @example
 * readPluginChanges({ label: ' Gate ', categories: 'Dynamics,Gate', _id: 'x' });
 * // { label: 'Gate', categories: ['Dynamics', 'Gate'] }
 */
export const readPluginChanges = body => {
	const isGivenField = ([field]) => typeof body?.[field] === 'string';
	const givenFields = Object.entries(FIELD_PARSERS).filter(isGivenField);
	const changes = Object.fromEntries(givenFields.map(([field, parse]) => [field, parse(body[field])]));
	const hasUnusableName = changes.name !== undefined && !toPluginId(changes.name);
	if (hasUnusableName) {
		throw new InvalidInputError('The name has no letter nor digit');
	}
	return changes;
};

/**
 * Reads the plugin of a create form, with the id made from its name. The image is a file of the
 * form, read by readPluginImage.
 *
 * @param {Record<string, unknown>} body - Text fields of the form.
 * @returns {Record<string, unknown>} The plugin to create, with its `id`.
 * @throws {InvalidInputError} When the name is missing or a field is invalid.
 */
export const readPluginForm = body => {
	const fields = readPluginChanges(body);
	if (fields.name === undefined) {
		throw new InvalidInputError('Missing name');
	}
	return { id: toPluginId(fields.name), ...fields };
};

/**
 * Reads the image of a plugin form. An empty file input sends a file of 0 bytes: it means no image.
 *
 * @param {File | undefined} file - The `image` file of the form.
 * @returns {File | null} The image, or null when the form has none.
 * @throws {InvalidInputError} When the file is not a PNG, JPEG, GIF or WebP image, or is larger than MAX_PLUGIN_IMAGE_BYTES.
 */
export const readPluginImage = file => {
	const hasImage = Boolean(file?.size);
	if (!hasImage) {
		return null;
	}
	const isSupportedType = PLUGIN_IMAGE_TYPES.includes(file.type);
	if (!isSupportedType) {
		throw new InvalidInputError('Unsupported image type');
	}
	if (file.size > MAX_PLUGIN_IMAGE_BYTES) {
		throw new InvalidInputError('Image too large');
	}
	return file;
};
