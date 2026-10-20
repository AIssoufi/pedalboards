// Fails when the bundle of the deployed Worker holds code of the write routes. Run `pnpm build` first.
import { readFile } from 'node:fs/promises';

import { WORKER_BUNDLE_URL, WRITE_ONLY_MARKERS } from './constants.js';

const bundle = await readFile(WORKER_BUNDLE_URL, 'utf8');
const markers = WRITE_ONLY_MARKERS.filter(marker => bundle.includes(marker));

if (markers.length) {
	console.error(`The Worker bundle holds write-only code: ${markers.join(', ')}`);
	process.exit(1);
}
console.log(`The Worker bundle holds none of: ${WRITE_ONLY_MARKERS.join(', ')}`);
