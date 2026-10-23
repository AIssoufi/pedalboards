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

/** Headers file of the production build, which `vite build` copies from `public/` */
export const BUILD_HEADERS_URL = new URL('../build/_headers', import.meta.url);

/** Headers that each path pattern of the headers file must set, for Cloudflare Pages to send */
export const REQUIRED_HEADERS = [
  {
    pattern: '/*',
    headers: [
      'Strict-Transport-Security',
      'X-Frame-Options',
      'Permissions-Policy',
      'Content-Security-Policy-Report-Only'
    ]
  },
  // The long cache of the files that Vite names after a hash of their content
  { pattern: '/assets/*', headers: ['Cache-Control'] }
];

/** Indentation that starts the header lines of a rule in a headers file */
export const INDENTED_LINE = /^\s/;
