import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// The tests run in the Workers runtime, with the bindings of wrangler.jsonc, a local D1 that
// test/apply-migrations.js fills with the migrations and a local R2 bucket
export default defineConfig({
	plugins: [
		cloudflareTest(async () => ({
			wrangler: { configPath: './wrangler.jsonc' },
			miniflare: {
				bindings: { TEST_MIGRATIONS: await readD1Migrations('./migrations') },
				// The bucket of the plugin images, which only the local entry has in wrangler.jsonc
				r2Buckets: ['IMAGES']
			}
		}))
	],
	test: {
		restoreMocks: true,
		setupFiles: ['./test/apply-migrations.js']
	}
});
