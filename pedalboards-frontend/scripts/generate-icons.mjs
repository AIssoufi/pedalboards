// Writes the install icons that public/manifest.json lists, then commit them: a test fails while
// they differ from what icons.mjs draws. Run it after each change of the shapes or the brand color.

// Dependencies
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Constants
import { ICON_SIZES, ICONS_FOLDER_URL } from './constants.mjs';

// Utils
import { drawPedalIcon, toIconFileName } from './icons.mjs';
import { encodePng } from './png.mjs';

for (const size of ICON_SIZES) {
  const iconUrl = new URL(toIconFileName(size), ICONS_FOLDER_URL);
  const png = encodePng(drawPedalIcon(size));
  await writeFile(iconUrl, png);
  console.log(`Wrote ${png.length} bytes to ${fileURLToPath(iconUrl)}`);
}
