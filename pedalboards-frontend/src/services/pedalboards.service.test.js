import { jsonResponse } from '../test-utils/fetch';
import { FIRST_PAGE } from '../utils/page/constants';
import { DEFAULT_PAGE_SIZE } from './constants';
import PedalboardService from './pedalboards.service';

const fetchedUrl = () => String(window.fetch.mock.calls[0][0]);

beforeEach(() => {
  vi.spyOn(window, 'fetch').mockResolvedValue(jsonResponse({ body: {} }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getPlugin', () => {
  it('keeps the id in one path segment', async () => {
    await PedalboardService.getPlugin('a/b?c#d e');

    expect(fetchedUrl()).toMatch(/\/api\/plugin\/a%2Fb%3Fc%23d%20e$/);
  });

  it('keeps a slug as it is', async () => {
    await PedalboardService.getPlugin('mda-overdrive');

    expect(fetchedUrl()).toMatch(/\/api\/plugin\/mda-overdrive$/);
  });
});

describe('getPlugins', () => {
  it('sends the page and the page size', async () => {
    await PedalboardService.getPlugins({ page: 3, pageSize: 20 });

    const { pathname, searchParams } = new URL(fetchedUrl());
    expect(pathname).toMatch(/\/api\/plugins$/);
    expect(searchParams.get('page')).toBe('3');
    expect(searchParams.get('pagesize')).toBe('20');
  });

  it.each([
    ['no parameters', undefined],
    ['an empty object', {}],
    ['undefined fields', { page: undefined, pageSize: undefined }],
    ['null fields', { page: null, pageSize: null }]
  ])('sends the default page and page size for %s', async (description, params) => {
    await PedalboardService.getPlugins(params);

    const { searchParams } = new URL(fetchedUrl());
    expect(searchParams.get('page')).toBe(String(FIRST_PAGE));
    expect(searchParams.get('pagesize')).toBe(String(DEFAULT_PAGE_SIZE));
  });
});

describe('findPlugins', () => {
  it('sends each filter, the page and the page size', async () => {
    await PedalboardService.findPlugins({
      filters: new URLSearchParams('brand=A%26B&label=Gx'), page: 2, pageSize: 10
    });

    const { searchParams } = new URL(fetchedUrl());
    expect(searchParams.get('filterby[brand]')).toBe('A&B');
    expect(searchParams.get('filterby[label]')).toBe('Gx');
    expect(searchParams.get('page')).toBe('2');
    expect(searchParams.get('pagesize')).toBe('10');
  });

  it('sends the default page and page size when none is given', async () => {
    await PedalboardService.findPlugins({ filters: new URLSearchParams('brand=MDA') });

    const { searchParams } = new URL(fetchedUrl());
    expect(searchParams.get('page')).toBe(String(FIRST_PAGE));
    expect(searchParams.get('pagesize')).toBe(String(DEFAULT_PAGE_SIZE));
  });

  it.each([
    ['filters that are not URLSearchParams', { filters: { brand: 'MDA' } }],
    ['missing filters', {}],
    ['no parameters', undefined]
  ])('sends no filter for %s', async (description, params) => {
    await PedalboardService.findPlugins(params);

    expect(fetchedUrl()).not.toContain('filterby');
  });
});
