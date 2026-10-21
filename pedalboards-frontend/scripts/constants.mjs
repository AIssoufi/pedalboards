/** Folder of the scripts of the production build, written by `vite build` */
export const BUILD_ASSETS_URL = new URL('../build/assets/', import.meta.url);

/** Extension of the script files of the build */
export const SCRIPT_EXTENSION = '.js';

/** Texts that only development code holds: none of them may ship to visitors */
export const DEVELOPMENT_ONLY_MARKERS = [
  // The checks that Redux Toolkit runs in development only: the messages of its immutability and
  // serializability middlewares, which the production build of the store leaves out
  'A state mutation was detected',
  'A non-serializable value was detected'
];
