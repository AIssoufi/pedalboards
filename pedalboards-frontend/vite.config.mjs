import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port of the development server, the one the README and the root `start` script give the frontend
const DEV_SERVER_PORT = 3001;
// Folder of the production build, the output folder that Cloudflare Pages publishes
const BUILD_FOLDER = 'build';

export default defineConfig({
  plugins: [react()],
  server: {
    port: DEV_SERVER_PORT,
    // Fails when the port is taken rather than moving to the next one, the port of the CMS
    strictPort: true
  },
  build: {
    outDir: BUILD_FOLDER
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
