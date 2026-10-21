import { jsonResponse } from '../test-utils/fetch';
import PedalboardService from './pedalboards.service';

const fetchedUrl = () => String(window.fetch.mock.calls[0][0]);

beforeEach(() => {
  vi.spyOn(window, 'fetch').mockResolvedValue(jsonResponse({ body: {} }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the methods of one plugin', () => {
  it.each([
    ['getPlugin', id => PedalboardService.getPlugin(id)],
    ['updatePlugin', id => PedalboardService.updatePlugin(id, {})],
    ['deletePlugin', id => PedalboardService.deletePlugin(id)]
  ])('%s keeps the id in one path segment', async (name, call) => {
    await call('a/b?c#d e');

    expect(fetchedUrl()).toMatch(/\/api\/plugin\/a%2Fb%3Fc%23d%20e$/);
  });

  it('keeps a slug as it is', async () => {
    await PedalboardService.getPlugin('mda-overdrive');

    expect(fetchedUrl()).toMatch(/\/api\/plugin\/mda-overdrive$/);
  });
});

describe('findPlugins', () => {
  it('sends each filter, the page and the page size', async () => {
    await PedalboardService.findPlugins(new URLSearchParams('brand=A%26B'), 2, 10);

    const { searchParams } = new URL(fetchedUrl());
    expect(searchParams.get('filterby[brand]')).toBe('A&B');
    expect(searchParams.get('page')).toBe('2');
    expect(searchParams.get('pagesize')).toBe('10');
  });

  it('ignores filters that are not URLSearchParams', async () => {
    await PedalboardService.findPlugins({ brand: 'MDA' });

    expect(fetchedUrl()).not.toContain('filterby');
  });
});
