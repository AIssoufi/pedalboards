import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

// Creates and seeds the plugins table before the tests, as `wrangler d1 migrations apply` does
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
