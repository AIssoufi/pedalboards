// Writes public/sitemap.xml from the plugin seed. Run it after each change of data/plugins.json of
// the core service, then commit both: a test fails while they disagree. `pnpm generate:sitemap`
// hides the warning of Node.js on src/constants/routes.js, an ES module in a package with no type.

// Dependencies
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Constants
import { SEED_DATA_URL, SITEMAP_URL } from './constants.mjs';

// Utils
import { buildSitemap } from './sitemap.mjs';

const plugins = JSON.parse(await readFile(SEED_DATA_URL, 'utf8'));
await writeFile(SITEMAP_URL, buildSitemap(plugins));
console.log(`Wrote ${plugins.length} plugins to ${fileURLToPath(SITEMAP_URL)}`);
