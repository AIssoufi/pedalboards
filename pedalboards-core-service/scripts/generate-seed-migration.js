// Writes the migration that seeds D1 from data/plugins.json. Run it after each change of that file,
// then commit both: `wrangler d1 migrations apply` only runs a migration once per database.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { SEED_DATA_URL, SEED_MIGRATION_URL } from './constants.js';
import { buildSeedSql } from './seed-sql.js';

const plugins = JSON.parse(await readFile(SEED_DATA_URL, 'utf8'));
await writeFile(SEED_MIGRATION_URL, buildSeedSql(plugins));
console.log(`Wrote ${plugins.length} plugins to ${fileURLToPath(SEED_MIGRATION_URL)}`);
