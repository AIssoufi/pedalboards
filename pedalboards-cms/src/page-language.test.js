// Dependencies
import fs from 'fs';
import path from 'path';

const PAGE_TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html');

it('declares French, the language of most of the text, on the page', () => {
  const pageTemplate = fs.readFileSync(PAGE_TEMPLATE_PATH, 'utf8');

  expect(pageTemplate).toContain('<html lang="fr">');
});
