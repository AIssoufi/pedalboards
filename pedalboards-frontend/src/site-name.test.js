// Dependencies
import { readFileSync } from 'node:fs';

const readProjectFile = relativePath => (
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')
);

describe('the name of the site', () => {
  it('titles the page Pedalboards', () => {
    expect(readProjectFile('../index.html')).toContain('<title>Pedalboards</title>');
  });

  it('names the installed app Pedalboards', () => {
    expect(JSON.parse(readProjectFile('../public/manifest.json')).name).toBe('Pedalboards');
  });
});
