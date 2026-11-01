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
      // The enforcing policy: Content-Security-Policy-Report-Only, which blocks nothing, does not
      // count
      'Content-Security-Policy'
    ]
  },
  // The long cache of the files that Vite names after a hash of their content
  { pattern: '/assets/*', headers: ['Cache-Control'] }
];

/** Indentation that starts the header lines of a rule in a headers file */
export const INDENTED_LINE = /^\s/;

/** Plugins that seed the database, and so the plugin pages that the site serves */
export const SEED_DATA_URL = new URL(
  '../../pedalboards-core-service/data/plugins.json',
  import.meta.url
);

/** Sitemap of the site, written by generate-sitemap.mjs and copied to the build by Vite */
export const SITEMAP_URL = new URL('../public/sitemap.xml', import.meta.url);

/** Path of the sitemap on the site */
export const SITEMAP_PATHNAME = '/sitemap.xml';

/** XML namespace of the sitemap protocol */
export const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';
