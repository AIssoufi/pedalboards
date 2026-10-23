// Fails when the scripts of the production build hold development-only code, such as the state
// checks of Redux Toolkit, or when its headers file lacks a header that Cloudflare Pages must send.
// Run `pnpm build` first.
import { readdir, readFile } from 'node:fs/promises';

import {
  BUILD_ASSETS_URL,
  BUILD_HEADERS_URL,
  DEVELOPMENT_ONLY_MARKERS,
  REQUIRED_HEADERS,
  SCRIPT_EXTENSION
} from './constants.mjs';
import { findMarkers, findMissingHeaders, parseHeadersRules } from './utils.mjs';

// An empty list when the build folder is missing, so that the message below tells what to run
const entries = await readdir(BUILD_ASSETS_URL).catch(error => {
  if (error.code === 'ENOENT') {
    return [];
  }
  throw error;
});
const names = entries.filter(name => name.endsWith(SCRIPT_EXTENSION));

if (!names.length) {
  console.error(`No script in ${BUILD_ASSETS_URL.pathname}: run \`pnpm build\` first`);
  process.exit(1);
}

const files = await Promise.all(names.map(async name => ({
  name,
  contents: await readFile(new URL(name, BUILD_ASSETS_URL), 'utf8')
})));
const found = findMarkers({ files, markers: DEVELOPMENT_ONLY_MARKERS });

if (found.length) {
  found.forEach(({ file, marker }) => {
    console.error(`${file} holds development-only code: ${marker}`);
  });
  process.exit(1);
}
console.log(`Scripts checked: ${names.length}. None holds: ${DEVELOPMENT_ONLY_MARKERS.join(', ')}`);

// Null when the file is missing, which Vite copies from public/_headers
const headersFile = await readFile(BUILD_HEADERS_URL, 'utf8').catch(error => {
  if (error.code === 'ENOENT') {
    return null;
  }
  throw error;
});

if (headersFile === null) {
  console.error(`No ${BUILD_HEADERS_URL.pathname}: add public/_headers, then run \`pnpm build\``);
  process.exit(1);
}

const missingHeaders = findMissingHeaders({
  rules: parseHeadersRules(headersFile),
  required: REQUIRED_HEADERS
});

if (missingHeaders.length) {
  missingHeaders.forEach(({ pattern, header }) => {
    console.error(`_headers sets no ${header} on ${pattern}`);
  });
  process.exit(1);
}
console.log(`Headers checked: ${REQUIRED_HEADERS.map(({ pattern }) => pattern).join(', ')}`);
