import { describe, expect, it } from 'vitest';

import { MAX_SEARCH_TEXT_LENGTH } from '../constants.js';
import { InvalidInputError } from '../errors.js';
import { escapeLikePattern, parseFilters, parseSearchText } from './filters.js';

describe('escapeLikePattern', () => {
	it('escapes the LIKE wildcards and the escape character', () => {
		expect(escapeLikePattern('100%')).toBe('100\\%');
		expect(escapeLikePattern('a_b')).toBe('a\\_b');
		expect(escapeLikePattern('C:\\')).toBe('C:\\\\');
	});

	it('keeps the other characters, regular expression ones included', () => {
		expect(escapeLikePattern("C++ (a.b) [x] 'quoted'")).toBe("C++ (a.b) [x] 'quoted'");
	});
});

describe('parseSearchText', () => {
	it('reads a text', () => {
		expect(parseSearchText('mda')).toBe('mda');
	});

	it('gives an empty text when the parameter is missing', () => {
		expect(parseSearchText(undefined)).toBe('');
	});

	it('refuses a repeated parameter', () => {
		expect(() => parseSearchText(['a', 'b'])).toThrow(InvalidInputError);
	});

	it('refuses a text longer than the limit', () => {
		expect(parseSearchText('a'.repeat(MAX_SEARCH_TEXT_LENGTH))).toHaveLength(MAX_SEARCH_TEXT_LENGTH);
		expect(() => parseSearchText('a'.repeat(MAX_SEARCH_TEXT_LENGTH + 1))).toThrow(InvalidInputError);
	});
});

describe('parseFilters', () => {
	it('reads the searchable fields and ignores the other parameters', () => {
		const query = {
			'filterby[brand]': 'mda',
			'filterby[categories]': 'Delay',
			'filterby[label]': 'Echo',
			'filterby[name]': 'Gx',
			page: '2',
			filterby: 'name'
		};

		expect(parseFilters(query)).toEqual({ brand: 'mda', categories: 'Delay', label: 'Echo', name: 'Gx' });
	});

	it('leaves out the empty texts', () => {
		expect(parseFilters({ 'filterby[brand]': '', 'filterby[label]': 'Echo' })).toEqual({ label: 'Echo' });
	});

	it.each(['description', 'uri', '__proto__', 'constructor', ''])('refuses the field "%s"', field => {
		expect(() => parseFilters({ [`filterby[${field}]`]: 'x' })).toThrow(InvalidInputError);
	});

	it('refuses a repeated filter', () => {
		expect(() => parseFilters({ 'filterby[brand]': ['a', 'b'] })).toThrow(InvalidInputError);
	});
});
