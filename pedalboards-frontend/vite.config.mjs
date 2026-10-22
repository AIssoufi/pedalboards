import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// Port of the development server, the one the README and the root `start` script give the frontend
const DEV_SERVER_PORT = 3001;
// Folder of the production build, the output folder that Cloudflare Pages publishes
const BUILD_FOLDER = 'build';
// Report of the size of each module in the bundle, written by `pnpm report:bundle` outside the
// build folder, so that it is never published
const BUNDLE_REPORT_FILE = 'bundle-report.html';
// Set by `pnpm report:bundle`: a plain `pnpm build` writes no report
const IS_BUNDLE_REPORT = process.env.BUNDLE_REPORT === 'true';

export default defineConfig({
  plugins: [
    react(),
    // Last, so that it measures the minified scripts through their source maps. It gives no gzip
    // size in that mode, and the sizes it gives without it are those before minification
    IS_BUNDLE_REPORT && visualizer({ filename: BUNDLE_REPORT_FILE, sourcemap: true })
  ],
  server: {
    port: DEV_SERVER_PORT,
    // Fails when the port is taken rather than moving to the next one, the port of the CMS
    strictPort: true
  },
  build: {
    outDir: BUILD_FOLDER,
    // The report reads the size of each module in the source maps of the minified scripts, which
    // keep no comment pointing to them, as the scripts that visitors download
    sourcemap: IS_BUNDLE_REPORT && 'hidden'
  },
  test: {
    environment: 'jsdom',
    // describe, it, expect and vi without an import, as the Jest globals were
    globals: true,
    // Creates jsdom once per worker and keeps each test file apart: the default pool, creating it
    // once per file, made the tests three times slower
    pool: 'vmThreads',
    setupFiles: ['./src/test-utils/setup.js']
  }
});
