// Dependencies
import { readFileSync } from 'node:fs';

const readProjectFile = relativePath => (
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')
);

describe('the name of the site', () => {
  it('titles the page Pedalboards', () => {
    expect(readProjectFile('../index.html')).toContain('<title>Pedalboards</title>');
  });

  it('names the installed app Pedalboards, in full and in short', () => {
    const manifest = JSON.parse(readProjectFile('../public/manifest.json'));

    expect(manifest.name).toBe('Pedalboards');
    expect(manifest.short_name).toBe('Pedalboards');
  });
});

describe('the link preview of the site', () => {
  const page = new DOMParser().parseFromString(readProjectFile('../index.html'), 'text/html');
  const readMeta = selector => page.head.querySelector(selector)?.getAttribute('content');

  it('describes the page for search engines and previews', () => {
    const description = readMeta('meta[name="description"]');

    expect(description).toMatch(/\S/);
    expect(readMeta('meta[property="og:description"]')).toBe(description);
  });

  it.each([
    ['meta[property="og:type"]', 'website'],
    ['meta[property="og:site_name"]', 'Pedalboards'],
    ['meta[property="og:title"]', 'Pedalboards'],
    ['meta[property="og:url"]', 'https://pedalboards.issoufi.fr/'],
    ['meta[property="og:image"]', 'https://pedalboards.issoufi.fr/social-preview.jpg'],
    ['meta[property="og:image:width"]', '1200'],
    ['meta[property="og:image:height"]', '630'],
    ['meta[name="twitter:card"]', 'summary_large_image']
  ])('sets %s to %s', (selector, expected) => {
    expect(readMeta(selector)).toBe(expected);
  });

  it('describes the preview image for screen readers', () => {
    expect(readMeta('meta[property="og:image:alt"]')).toMatch(/\S/);
  });

  it('ships the preview image that the tags name, not an empty file', () => {
    expect(readProjectFile('../public/social-preview.jpg').length).toBeGreaterThan(0);
  });
});
