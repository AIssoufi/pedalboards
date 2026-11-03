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

/** Folder of the install icons, written by generate-icons.mjs and copied to the build by Vite */
export const ICONS_FOLDER_URL = new URL('../public/', import.meta.url);

/** Widths, and heights, of the square install icons, in pixels */
export const ICON_SIZES = [192, 512];

/** Brand color of the site: the background of the icons and the theme color of the manifest */
export const BRAND_COLOR = '#883996';

/** Red, green and blue of the brand color, from 0 to 255 */
export const BRAND_RGB = [0x88, 0x39, 0x96];

/** Red, green and blue of white, from 0 to 255 */
export const WHITE_RGB = [0xff, 0xff, 0xff];

/** Channels of a pixel of the icons: red, green and blue */
export const RGB_CHANNELS = 3;

/** Bytes that open every PNG file */
export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Bytes of a PNG number: the length and the checksum of a chunk, or a side of an image */
export const UINT32_BYTES = 4;

/** Bytes of the four-letter type of a PNG chunk */
export const CHUNK_TYPE_BYTES = 4;

/** Bits per channel of a pixel: one byte each */
export const BIT_DEPTH = 8;

/** PNG color type of an opaque image with red, green and blue channels */
export const RGB_COLOR_TYPE = 2;

/** Compression method of the PNG header: deflate, the only one the format defines */
export const DEFLATE_COMPRESSION = 0;

/** Filter method of the PNG header: adaptive filtering, the only one the format defines */
export const ADAPTIVE_FILTERING = 0;

/** Interlace method of the PNG header: the rows are stored in order */
export const NO_INTERLACE = 0;

/** Filter byte that starts each row of pixels: the row is stored as it is */
export const NO_FILTER = 0;

/** Highest compression of zlib: the icons are written once and downloaded often */
export const COMPRESSION_LEVEL = 9;

/**
 * Samples per pixel along each axis: the icons blend 4 × 4 samples per pixel to smooth the edges of
 * the shapes
 */
export const SAMPLES_PER_AXIS = 4;

/**
 * Shapes of the icon, a white effect pedal with two knobs and a footswitch, drawn in order over the
 * brand color. Each one is a rounded rectangle measured in fractions of the icon side; a circle is
 * one whose half sizes equal its radius. The pedal stays inside the central circle of 40% radius,
 * which a launcher that crops icons to its own shape keeps.
 */
export const PEDAL_ICON_SHAPES = [
  // The body of the pedal
  {
    centerX: 0.5,
    centerY: 0.5,
    halfWidth: 0.2,
    halfHeight: 0.32,
    radius: 0.06,
    color: WHITE_RGB
  },
  // The two knobs
  {
    centerX: 0.4,
    centerY: 0.31,
    halfWidth: 0.055,
    halfHeight: 0.055,
    radius: 0.055,
    color: BRAND_RGB
  },
  {
    centerX: 0.6,
    centerY: 0.31,
    halfWidth: 0.055,
    halfHeight: 0.055,
    radius: 0.055,
    color: BRAND_RGB
  },
  // The pointer of each knob, from its center to its top
  {
    centerX: 0.4,
    centerY: 0.28,
    halfWidth: 0.01,
    halfHeight: 0.03,
    radius: 0.01,
    color: WHITE_RGB
  },
  {
    centerX: 0.6,
    centerY: 0.28,
    halfWidth: 0.01,
    halfHeight: 0.03,
    radius: 0.01,
    color: WHITE_RGB
  },
  // The footswitch, a ring
  {
    centerX: 0.5,
    centerY: 0.66,
    halfWidth: 0.085,
    halfHeight: 0.085,
    radius: 0.085,
    color: BRAND_RGB
  },
  {
    centerX: 0.5,
    centerY: 0.66,
    halfWidth: 0.045,
    halfHeight: 0.045,
    radius: 0.045,
    color: WHITE_RGB
  }
];
