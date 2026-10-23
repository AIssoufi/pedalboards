// Pure helpers of the bundle check
import { INDENTED_LINE } from './constants.mjs';

/**
 * Tells whether a marker can be searched: a blank one would match every file.
 *
 * @param {unknown} marker
 * @returns {boolean} True for a string holding more than spaces.
 */
const isSearchable = marker => typeof marker === 'string' && marker.trim() !== '';

/**
 * @typedef {Object} BundleFile
 * @property {string} name - Name of the file, shown in the report.
 * @property {string} contents - Text of the file.
 */

/**
 * @typedef {Object} FindMarkersParams
 * @property {BundleFile[]} [files] - Script files of the build.
 * @property {string[]} [markers] - Pieces of code that may not ship.
 */

/**
 * @typedef {Object} FoundMarker
 * @property {string} file - Name of the file that holds the marker.
 * @property {string} marker - The marker found.
 */

/**
 * Lists each marker found in each file, in the order of the files, then of the markers.
 *
 * @param {FindMarkersParams | null} [params]
 * @returns {FoundMarker[]} Empty when no file holds a marker, or when files or markers are not
 * lists. Blank markers and files without text are skipped, since a blank marker would match
 * every file.
 */
export const findMarkers = params => {
  const { files, markers } = params ?? {};
  const searchedFiles = Array.isArray(files) ? files : [];
  const searchedMarkers = Array.isArray(markers) ? markers.filter(isSearchable) : [];

  return searchedFiles.flatMap(file => {
    const { name, contents } = file ?? {};
    const hasText = typeof contents === 'string';

    if (!hasText) {
      return [];
    }

    return searchedMarkers
      .filter(marker => contents.includes(marker))
      .map(marker => ({ file: name, marker }));
  });
};

/**
 * @typedef {Object} HeadersRule
 * @property {string} pattern - Path pattern of the rule, such as `/assets/*`.
 * @property {string[]} headers - Names of the headers that the rule sets, in lower case.
 */

/**
 * Reads the rules of a Cloudflare Pages headers file: each one starts with a path pattern at the
 * start of a line, followed by indented `Name: value` lines.
 *
 * @param {unknown} contents - Text of the file.
 * @returns {HeadersRule[]} The rules in the order of the file, empty when the text is not a string.
 * Blank lines, `#` comments, lines without a colon and header lines before any pattern are skipped.
 */
export const parseHeadersRules = contents => {
  if (typeof contents !== 'string') {
    return [];
  }

  const rules = [];

  for (const line of contents.split('\n')) {
    const text = line.trim();
    const isSkipped = text === '' || text.startsWith('#');

    if (isSkipped) {
      continue;
    }

    const isPattern = !INDENTED_LINE.test(line);

    if (isPattern) {
      rules.push({ pattern: text, headers: [] });
      continue;
    }

    const currentRule = rules.at(-1);
    const separatorIndex = text.indexOf(':');
    const isHeader = Boolean(currentRule) && separatorIndex > 0;

    if (isHeader) {
      currentRule.headers.push(text.slice(0, separatorIndex).trim().toLowerCase());
    }
  }
  return rules;
};

/**
 * @typedef {Object} RequiredHeaders
 * @property {string} pattern - Path pattern of the rule.
 * @property {string[]} headers - Names of the headers that the rule must set, in any case.
 */

/**
 * @typedef {Object} FindMissingHeadersParams
 * @property {HeadersRule[]} [rules] - Rules read from the headers file.
 * @property {RequiredHeaders[]} [required] - Headers that each pattern must set.
 */

/**
 * @typedef {Object} MissingHeader
 * @property {string} pattern - Path pattern whose rules lack the header.
 * @property {string} header - Name of the missing header, as required.
 */

/**
 * Lists each required header that no rule of its pattern sets, comparing names in any case.
 *
 * @param {FindMissingHeadersParams | null} [params]
 * @returns {MissingHeader[]} Empty when every header is set, or when nothing is required. Rules
 * or requirements that are not lists count as empty lists, and a requirement without a pattern
 * is skipped.
 */
export const findMissingHeaders = params => {
  const { rules, required } = params ?? {};
  const readRules = Array.isArray(rules) ? rules : [];
  const requiredHeaders = Array.isArray(required) ? required : [];

  return requiredHeaders.flatMap(requirement => {
    const { pattern, headers } = requirement ?? {};

    if (!isSearchable(pattern)) {
      return [];
    }

    const isRuleOfPattern = rule => Boolean(rule) && rule.pattern === pattern;
    const names = Array.isArray(headers) ? headers.filter(isSearchable) : [];
    const setNames = readRules
      .filter(isRuleOfPattern)
      .flatMap(rule => (Array.isArray(rule.headers) ? rule.headers : []));
    const isMissing = name => !setNames.includes(name.toLowerCase());

    return names.filter(isMissing).map(name => ({ pattern, header: name }));
  });
};
