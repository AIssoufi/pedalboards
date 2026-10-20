// Pure helpers of the dev server check: reading the page, the types of the answers and the state
// of the server process

/** `src` attribute of a `<script>` tag, in double, single or no quotes. */
const SCRIPT_SOURCE_PATTERN = /<script\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;

/** Media types a browser runs as a script. */
const JAVASCRIPT_TYPE_PATTERN = /^\s*(?:text|application)\/javascript\s*(?:;|$)/i;

/** Media type of an HTML page. */
const HTML_TYPE_PATTERN = /^\s*text\/html\s*(?:;|$)/i;

/**
 * @typedef {Object} IsUrlSourceParams
 * @property {string} source - Value of the `src` attribute.
 * @property {string} pageUrl - URL of the page, which a relative source resolves against.
 */

/**
 * Tells whether the `src` attribute of a script holds a URL, alone or relative to the page.
 *
 * @param {IsUrlSourceParams} params
 * @returns {boolean} False for an empty or blank source, or one that is not a URL.
 */
const isUrlSource = ({ source, pageUrl }) => {
  const isBlank = source.trim() === '';

  return !isBlank && URL.canParse(source, pageUrl);
};

/**
 * @typedef {Object} FindLocalScriptUrlsParams
 * @property {string} html - HTML of the page.
 * @property {string} pageUrl - URL the page was requested from, which relative sources resolve
 * against.
 */

/**
 * Lists the URLs of the scripts a page loads from its own origin, in their order in the page.
 * Inline scripts, sources that are not URLs and scripts of other origins, such as a CDN, are left
 * out.
 *
 * @param {FindLocalScriptUrlsParams} params
 * @returns {string[]} Absolute URLs of the scripts, empty when the page loads none.
 * @example
 * findLocalScriptUrls({
 *   html: '<script type="module" src="/src/index.jsx"></script>',
 *   pageUrl: 'http://127.0.0.1:5173/'
 * });
 * // ['http://127.0.0.1:5173/src/index.jsx']
 */
export const findLocalScriptUrls = ({ html, pageUrl }) => {
  const { origin } = new URL(pageUrl);

  return [...String(html ?? '').matchAll(SCRIPT_SOURCE_PATTERN)]
    .map(([, doubleQuoted, singleQuoted, unquoted]) => doubleQuoted ?? singleQuoted ?? unquoted)
    .filter(source => isUrlSource({ source, pageUrl }))
    .map(source => new URL(source, pageUrl))
    .filter(url => url.origin === origin)
    .map(url => url.href);
};

/**
 * Tells whether a `Content-Type` header names JavaScript.
 *
 * @param {string | null | undefined} contentType - Value of the header, missing when the answer
 * has none.
 * @returns {boolean} True for `text/javascript` and `application/javascript`, with any parameter.
 */
export const isJavaScriptType = contentType => JAVASCRIPT_TYPE_PATTERN.test(contentType ?? '');

/**
 * Tells whether a `Content-Type` header names an HTML page.
 *
 * @param {string | null | undefined} contentType - Value of the header, missing when the answer
 * has none.
 * @returns {boolean} True for `text/html`, with any parameter.
 */
export const isHtmlType = contentType => HTML_TYPE_PATTERN.test(contentType ?? '');

/**
 * @typedef {Object} ProcessState
 * @property {number | null} exitCode - Exit code, null while the process runs or when a signal
 * stopped it.
 * @property {string | null} signalCode - Signal that stopped the process, null otherwise.
 */

/**
 * Tells whether a child process has stopped, by exiting or by a signal.
 *
 * @param {ProcessState} child - Child process to check, such as a `ChildProcess`.
 * @returns {boolean} True once the process has stopped.
 */
export const hasStopped = child => child.exitCode !== null || child.signalCode !== null;

/**
 * Describes how a stopped child process ended.
 *
 * @param {ProcessState} child - Stopped child process, such as a `ChildProcess`.
 * @returns {string} The signal that stopped it, or its exit code.
 * @example
 * describeStop({ exitCode: null, signalCode: 'SIGTERM' }); // 'signal SIGTERM'
 * describeStop({ exitCode: 1, signalCode: null }); // 'exit code 1'
 */
export const describeStop = child => (
  child.signalCode ? `signal ${child.signalCode}` : `exit code ${child.exitCode}`
);
