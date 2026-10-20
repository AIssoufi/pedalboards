import { describe, expect, it } from 'vitest';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE, MAX_PAGE_SIZE } from '../constants.js';
import { countPages, parsePagination, parsePositiveInteger } from './pagination.js';

describe('parsePositiveInteger', () => {
	const read = value => parsePositiveInteger({ value, fallback: 7, max: 50 });

	it('reads an integer of at least 1', () => {
		expect(read('1')).toBe(1);
		expect(read('42')).toBe(42);
		expect(read('007')).toBe(7);
	});

	it('lowers a value above the limit to it', () => {
		expect(read('50')).toBe(50);
		expect(read('51')).toBe(50);
		expect(read('99999999999999999999999')).toBe(50);
	});

	it.each([
		['missing', undefined],
		['empty', ''],
		['zero', '0'],
		['negative', '-1'],
		['decimal', '1.5'],
		['exponent', '1e3'],
		['signed', '+3'],
		['spaced', ' 2'],
		['not a number', 'abc'],
		['null', null],
		['repeated', ['1', '2']]
	])('falls back for a %s value', (label, value) => {
		expect(read(value)).toBe(7);
	});
});

describe('parsePagination', () => {
	it('uses the defaults without parameters', () => {
		expect(parsePagination({})).toEqual({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE });
	});

	it('reads the page and the page size', () => {
		expect(parsePagination({ page: '3', pagesize: '20' })).toEqual({ page: 3, pageSize: 20 });
	});

	it('caps the page and the page size', () => {
		expect(parsePagination({ page: '9999999999', pagesize: '1000' }))
			.toEqual({ page: MAX_PAGE, pageSize: MAX_PAGE_SIZE });
	});

	it('falls back to the defaults for invalid values', () => {
		expect(parsePagination({ page: 'abc', pagesize: '-1' }))
			.toEqual({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE });
	});
});

describe('countPages', () => {
	it('rounds a partial last page up', () => {
		expect(countPages({ count: 50, pageSize: 10 })).toBe(5);
		expect(countPages({ count: 51, pageSize: 10 })).toBe(6);
	});

	it('gives no page for an empty list', () => {
		expect(countPages({ count: 0, pageSize: 10 })).toBe(0);
	});
});
