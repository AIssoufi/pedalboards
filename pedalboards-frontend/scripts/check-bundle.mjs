// Fails when the scripts of the production build hold development-only code, such as the state
// checks of Redux Toolkit. Run `pnpm build` first.
import { readdir, readFile } from 'node:fs/promises';

import { BUILD_ASSETS_URL, DEVELOPMENT_ONLY_MARKERS, SCRIPT_EXTENSION } from './constants.mjs';
import { findMarkers } from './utils.mjs';

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
