import { describe, expect, it } from 'vitest';

import { MAX_PLUGIN_IMAGE_BYTES } from '../constants.js';
import { InvalidInputError } from '../errors.js';
import {
	parseAuthor,
	parseCategories,
	parseControlPorts,
	parseCount,
	parseJsonField,
	readPluginChanges,
	readPluginForm,
	readPluginImage
} from './plugin-form.js';

// The fields of the form of the CMS, which sends every value as text
const FORM = {
	author: '{"avatarUrl":"","name":"MDA"}',
	brand: 'MDA',
	categories: ' Distortion,Simulator ',
	controlPorts: '[{"name":"Drive","default":0.25,"max":1,"min":0}]',
	description: 'Overdrive',
	label: 'Overdrive',
	name: ' MDA Overdrive ',
	uri: 'http://moddevices.com/plugins/mda/Overdrive',
	version: '1:0.3-6'
};

/**
 * Builds an uploaded file.
 *
 * @param {Object} params
 * @param {number} params.size - Size in bytes.
 * @param {string} params.type - Media type.
 * @param {string} [params.name] - File name.
 * @returns {File} The file.
 */
const toFile = ({ size, type, name = 'screenshot' }) => new File([new Uint8Array(size)], name, { type });

describe('parseJsonField', () => {
	it('parses a JSON value', () => {
		expect(parseJsonField('{"name":"MDA"}')).toEqual({ name: 'MDA' });
	});

	it.each(['{', '', 'undefined', undefined])('refuses %j', value => {
		expect(() => parseJsonField(value)).toThrow(InvalidInputError);
	});
});

describe('parseAuthor', () => {
	it('gives the author object', () => {
		expect(parseAuthor('{"name":"MDA"}')).toEqual({ name: 'MDA' });
	});

	it.each(['null', '[]', '"MDA"', '1'])('refuses %s, which is not an object', value => {
		expect(() => parseAuthor(value)).toThrow(InvalidInputError);
	});
});

describe('parseControlPorts', () => {
	it('gives the list of ports, empty included', () => {
		expect(parseControlPorts('[{"name":"Drive"}]')).toEqual([{ name: 'Drive' }]);
		expect(parseControlPorts('[]')).toEqual([]);
	});

	it.each(['{}', 'null', '[1]', '[null]', '[[]]'])('refuses %s, which is not a list of objects', value => {
		expect(() => parseControlPorts(value)).toThrow(InvalidInputError);
	});
});

describe('parseCategories', () => {
	it('trims the names and drops the empty ones', () => {
		expect(parseCategories(' Distortion, Simulator ,,')).toEqual(['Distortion', 'Simulator']);
	});

	it.each(['', ' ', ','])('gives no category for %j', value => {
		expect(parseCategories(value)).toEqual([]);
	});
});

describe('parseCount', () => {
	it.each([['0', 0], ['12', 12], [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER]])('reads %s', (value, count) => {
		expect(parseCount(value)).toBe(count);
	});

	it.each(['', '-1', '1.5', '1e3', ' 1', 'abc', String(Number.MAX_SAFE_INTEGER + 2)])('refuses %j', value => {
		expect(() => parseCount(value)).toThrow(InvalidInputError);
	});
});

describe('readPluginChanges', () => {
	it('parses each given field and ignores the others', () => {
		expect(readPluginChanges({ label: ' Gate ', pedalboardCount: '3', _id: 'x', screenshotUrl: 'x', stable: '1' }))
			.toEqual({ label: 'Gate', pedalboardCount: 3 });
	});

	it('ignores the fields that are not text, such as a file', () => {
		expect(readPluginChanges({ label: 3, brand: ['MDA'], author: null })).toEqual({});
	});

	it.each([undefined, null, {}])('gives no change for %j', body => {
		expect(readPluginChanges(body)).toEqual({});
	});

	it.each(['', '  ', '!?'])('refuses the name %j, which gives no id', name => {
		expect(() => readPluginChanges({ name })).toThrow(InvalidInputError);
	});

	it.each([
		['author', '{'],
		['controlPorts', '{}'],
		['pedalboardCount', 'many']
	])('refuses an invalid %s', (field, value) => {
		expect(() => readPluginChanges({ [field]: value })).toThrow(InvalidInputError);
	});
});

describe('readPluginForm', () => {
	it('parses the form and makes the id from the name', () => {
		expect(readPluginForm(FORM)).toEqual({
			id: 'mda-overdrive',
			author: { avatarUrl: '', name: 'MDA' },
			brand: 'MDA',
			categories: ['Distortion', 'Simulator'],
			controlPorts: [{ name: 'Drive', default: 0.25, max: 1, min: 0 }],
			description: 'Overdrive',
			label: 'Overdrive',
			name: 'MDA Overdrive',
			uri: 'http://moddevices.com/plugins/mda/Overdrive',
			version: '1:0.3-6'
		});
	});

	it('needs the name only', () => {
		expect(readPluginForm({ name: 'Gate' })).toEqual({ id: 'gate', name: 'Gate' });
	});

	it.each([{}, { ...FORM, name: undefined }, undefined])('refuses a form without a name: %j', body => {
		expect(() => readPluginForm(body)).toThrow(InvalidInputError);
	});
});

describe('readPluginImage', () => {
	it.each(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])('accepts a %s image', type => {
		const image = toFile({ size: 4, type });

		expect(readPluginImage(image)).toBe(image);
	});

	it('accepts an image of MAX_PLUGIN_IMAGE_BYTES', () => {
		const image = toFile({ size: MAX_PLUGIN_IMAGE_BYTES, type: 'image/png' });

		expect(readPluginImage(image)).toBe(image);
	});

	it('refuses an image of one byte more than MAX_PLUGIN_IMAGE_BYTES', () => {
		expect(() => readPluginImage(toFile({ size: MAX_PLUGIN_IMAGE_BYTES + 1, type: 'image/png' }))).toThrow(InvalidInputError);
	});

	it.each(['image/svg+xml', 'text/html', 'application/octet-stream', ''])('refuses a file of type %j', type => {
		expect(() => readPluginImage(toFile({ size: 4, type }))).toThrow(InvalidInputError);
	});

	it.each([
		['no file', undefined],
		['an empty file input', toFile({ size: 0, type: 'application/octet-stream', name: '' })]
	])('gives null for %s', (title, file) => {
		expect(readPluginImage(file)).toBeNull();
	});
});
