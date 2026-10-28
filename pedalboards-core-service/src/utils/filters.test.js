import { describe, expect, it } from 'vitest';

import { MAX_SEARCH_PATTERN_BYTES } from '../constants.js';
import { InvalidInputError } from '../errors.js';
import { createLikePattern, escapeLikePattern, parseFilters, parseSearchText } from './filters.js';

/** Longest text of one-byte characters: the pattern adds a `%` on each side */
const LONGEST_ASCII_TEXT_LENGTH = MAX_SEARCH_PATTERN_BYTES - 2;

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

	it('reads an empty text', () => {
		expect(parseSearchText('')).toBe('');
	});

	it('refuses a repeated parameter', () => {
		expect(() => parseSearchText(['a', 'b'])).toThrow(InvalidInputError);
	});

	it.each([
		['ASCII letters', 'a'.repeat(LONGEST_ASCII_TEXT_LENGTH)],
		['an escaped "%"', `${'a'.repeat(LONGEST_ASCII_TEXT_LENGTH - 2)}%`],
		['an escaped "\\"', `${'a'.repeat(LONGEST_ASCII_TEXT_LENGTH - 2)}\\`],
		['a two-byte "é"', `${'a'.repeat(LONGEST_ASCII_TEXT_LENGTH - 2)}é`],
		['a four-byte emoji', `${'a'.repeat(LONGEST_ASCII_TEXT_LENGTH - 4)}🎸`]
	])('reads a text of %s whose LIKE pattern reaches the byte limit', (description, text) => {
		expect(new TextEncoder().encode(createLikePattern(text))).toHaveLength(MAX_SEARCH_PATTERN_BYTES);
		expect(parseSearchText(text)).toBe(text);
		expect(() => parseSearchText(`a${text}`)).toThrow(InvalidInputError);
	});

	it('refuses a text far over the limit', () => {
		expect(() => parseSearchText('é'.repeat(MAX_SEARCH_PATTERN_BYTES))).toThrow(InvalidInputError);
	});

	it.each([null, 42, {}])('refuses the value %p', value => {
		expect(() => parseSearchText(value)).toThrow(InvalidInputError);
	});
});

describe('createLikePattern', () => {
	it('puts the escaped text between two "%"', () => {
		expect(createLikePattern('100%_')).toBe('%100\\%\\_%');
	});

	it('gives a pattern that matches anything for an empty text', () => {
		expect(createLikePattern('')).toBe('%%');
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
