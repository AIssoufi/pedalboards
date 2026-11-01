// Vitest runs this script in jsdom, which ESLint does not know from the folder
/* global DOMParser */

// Dependencies
import { readFileSync } from 'node:fs';

// Constants
import { SITE_ORIGIN } from '../src/constants/routes';
import { SITEMAP_PATHNAME } from './constants.mjs';

// Utils
import { buildPluginPathname } from '../src/utils/plugin-pathname';
import { buildSitemap, listSitemapUrls } from './sitemap.mjs';

const LIST_URL = 'https://pedalboards.issoufi.fr/plugins';
// The page of the list comes on top of the page of each plugin
const SEED_PLUGIN_COUNT = 50;
const SITEMAP_URL_COUNT = SEED_PLUGIN_COUNT + 1;
const GENERATE_HINT = 'public/sitemap.xml disagrees with the seed: run `pnpm generate:sitemap`';

const SEED_DATA_PATH = '../../pedalboards-core-service/data/plugins.json';
const SITEMAP_PATH = '../public/sitemap.xml';
const ROBOTS_PATH = '../public/robots.txt';

// The path stays a variable: Vite rewrites `new URL` around a literal path into the URL of an asset
const readProjectFile = relativePath => (
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')
);

const readSeed = () => JSON.parse(readProjectFile(SEED_DATA_PATH));

describe('listSitemapUrls', () => {
  it('lists the list of the plugins, then each plugin in the order of the seed', () => {
    expect(listSitemapUrls([{ name: 'MDA Overdrive' }, { name: 'abGate' }])).toEqual([
      LIST_URL,
      'https://pedalboards.issoufi.fr/plugin/mda-overdrive',
      'https://pedalboards.issoufi.fr/plugin/abgate'
    ]);
  });

  it('makes the ids as the seed migration does', () => {
    expect(listSitemapUrls([{ name: 'C* Plate - Versatile été' }])[1])
      .toBe('https://pedalboards.issoufi.fr/plugin/c-plate-versatile-ete');
  });

  it.each([
    ['a missing name', { label: 'Echo' }],
    ['a null name', { name: null }],
    ['an empty name', { name: '' }],
    ['a name without a letter nor a digit', { name: '***' }],
    ['a null record', null]
  ])('skips a record with %s', (_case, plugin) => {
    expect(listSitemapUrls([plugin])).toEqual([LIST_URL]);
  });

  it('reads a name that is not a text as a text', () => {
    expect(listSitemapUrls([{ name: 42 }])[1]).toBe('https://pedalboards.issoufi.fr/plugin/42');
  });

  it.each([
    ['nothing', undefined],
    ['null', null],
    ['an object', { name: 'abGate' }],
    ['a text', 'abGate'],
    ['an empty list', []]
  ])('lists the list page alone for %s', (_case, plugins) => {
    expect(listSitemapUrls(plugins)).toEqual([LIST_URL]);
  });
});

describe('buildSitemap', () => {
  const parse = text => new DOMParser().parseFromString(text, 'application/xml');
  const readLocations = text => [...parse(text).querySelectorAll('loc')]
    .map(location => location.textContent);

  it('writes one well-formed entry per address, with no date to keep up to date', () => {
    const sitemap = buildSitemap([{ name: 'abGate' }]);

    expect(parse(sitemap).querySelector('parsererror')).toBeNull();
    expect(parse(sitemap).documentElement.getAttribute('xmlns'))
      .toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(readLocations(sitemap)).toEqual(listSitemapUrls([{ name: 'abGate' }]));
    expect(sitemap).not.toContain('lastmod');
  });

  it('ends the file with a line break', () => {
    expect(buildSitemap([]).endsWith('</urlset>\n')).toBe(true);
  });

  it('writes the list page alone without plugins', () => {
    expect(readLocations(buildSitemap())).toEqual([LIST_URL]);
  });
});

describe('the sitemap of the site', () => {
  it('agrees with the plugin seed', () => {
    expect(readProjectFile(SITEMAP_PATH), GENERATE_HINT).toBe(buildSitemap(readSeed()));
  });

  it('lists the list of the plugins and the 50 plugins of the seed', () => {
    expect(readSeed()).toHaveLength(SEED_PLUGIN_COUNT);
    expect(listSitemapUrls(readSeed())).toHaveLength(SITEMAP_URL_COUNT);
    expect(new Set(listSitemapUrls(readSeed())).size).toBe(SITEMAP_URL_COUNT);
  });

  it('gives each plugin the path that the links of the site use', () => {
    const [, ...pluginUrls] = listSitemapUrls(readSeed());
    const ids = pluginUrls.map(url => url.split('/').pop());

    expect(pluginUrls).toEqual(ids.map(id => `${SITE_ORIGIN}${buildPluginPathname(id)}`));
  });

  it('is named by robots.txt with its absolute address', () => {
    expect(readProjectFile(ROBOTS_PATH).split('\n'))
      .toContain(`Sitemap: ${SITE_ORIGIN}${SITEMAP_PATHNAME}`);
  });
});
