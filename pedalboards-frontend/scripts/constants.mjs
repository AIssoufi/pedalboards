/** Folder of the scripts of the production build, written by `vite build` */
export const BUILD_ASSETS_URL = new URL('../build/assets/', import.meta.url);

/** Extension of the script files of the build */
export const SCRIPT_EXTENSION = '.js';

/** Code of development-only packages: none of it may ship to visitors */
export const DEVELOPMENT_ONLY_MARKERS = [
  // redux-logger: its name, in its error messages, and the labels of its console groups
  'redux-logger',
  'prev state',
  'next state'
];
