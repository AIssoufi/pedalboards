import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// The tests run in the Workers runtime, with the bindings of wrangler.jsonc and a local D1 that
// test/apply-migrations.js fills with the migrations
export default defineConfig({
	plugins: [
		cloudflareTest(async () => ({
			wrangler: { configPath: './wrangler.jsonc' },
			miniflare: {
				bindings: { TEST_MIGRATIONS: await readD1Migrations('./migrations') }
			}
		}))
	],
	test: {
		restoreMocks: true,
		setupFiles: ['./test/apply-migrations.js']
	}
});
