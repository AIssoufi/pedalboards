// Dependencies
import fs from 'fs';
import path from 'path';

const readProjectFile = relativePath => (
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
);

describe('the name of the admin', () => {
  it('titles the page Pedalboards Admin', () => {
    expect(readProjectFile('public/index.html')).toContain('<title>Pedalboards Admin</title>');
  });

  it('names the installed app Pedalboards Admin', () => {
    expect(JSON.parse(readProjectFile('public/manifest.json')).name).toBe('Pedalboards Admin');
  });
});
