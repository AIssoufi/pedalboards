// Reads and writes the trailers of a commit message (`Refs: PEDAL-47`, `Co-Authored-By: …`)
import { spawnSync } from 'node:child_process';

import { TEXT_ENCODING } from '../constants.mjs';
import { hasMessageContent } from './commit-message.mjs';

// A trailer line: a token, a colon and a value, such as `Refs: PEDAL-47`
const TRAILER_LINE_PATTERN = /^([A-Za-z0-9-]+):[ \t]*(.*)$/;
// Index of the subject line, which never holds a trailer
const SUBJECT_LINE_INDEX = 0;
// Options of `git interpret-trailers` for a commit message: unlike an email, a `---` line in its
// body does not end it
const COMMIT_MESSAGE_OPTIONS = ['--no-divider'];
// Before a trailer added to an empty message, as `git commit --signoff` does: an empty line for
// the subject, then the blank line that separates it from the trailers
const EMPTY_MESSAGE_PREFIX = '\n\n';

/**
 * A trailer of a commit message.
 *
 * @typedef {object} Trailer
 * @property {string} key - Token before the colon, such as `Refs`, in the case of the message.
 * @property {string} value - Text after the colon, trimmed, such as `PEDAL-47`.
 */

/**
 * Parameters of {@link interpretTrailers}.
 *
 * @typedef {object} InterpretTrailersParams
 * @property {string[]} options - Options of the command, such as `['--parse']`.
 * @property {string} message - Commit message, given on the standard input.
 */

/**
 * Runs `git interpret-trailers` on a commit message.
 *
 * @param {InterpretTrailersParams} params - The options and the message.
 * @returns {string | null} The output of git, or null when git cannot run or fails.
 */
const interpretTrailers = ({ options, message }) => {
  const result = spawnSync('git', ['interpret-trailers', ...options, ...COMMIT_MESSAGE_OPTIONS], {
    input: message,
    encoding: TEXT_ENCODING,
  });
  const hasSucceeded = result.status === 0;

  return hasSucceeded ? result.stdout : null;
};

/**
 * Reads one trailer line.
 *
 * @param {string} line - Line of a commit message.
 * @returns {Trailer | null} The trailer, or null when the line is not one.
 */
const parseTrailerLine = (line) => {
  const match = TRAILER_LINE_PATTERN.exec(line);

  return match ? { key: match[1], value: match[2].trim() } : null;
};

/**
 * Parses the trailers of a commit message the way git does, with
 * `git interpret-trailers --parse`: only the last paragraph holds trailers, and the comment
 * lines and the diff of `git commit --verbose` are skipped.
 *
 * @param {string} message - Commit message, possibly with the comments of the commit template.
 * @returns {Trailer[]} The trailers in their order, or none for a non-string or when git fails.
 */
export const parseTrailers = (message) => {
  if (typeof message !== 'string') return [];

  const output = interpretTrailers({ options: ['--parse'], message }) ?? '';

  return output.split('\n').map(parseTrailerLine).filter(Boolean);
};

/**
 * Finds the trailer lines that git does not read as trailers because a blank line follows them,
 * such as `Refs: PEDAL-20` in a paragraph of its own above `Co-Authored-By`. Older commits of the
 * repository have this layout.
 *
 * @param {string} message - Commit message.
 * @returns {Trailer[]} The trailers in their order, or none for a non-string. The subject line is
 *   never one.
 */
export const parseDetachedTrailers = (message) => {
  if (typeof message !== 'string') return [];

  const lines = message.split('\n');
  const isDetachedTrailerPlace = (line, index) => {
    const isBodyLine = index > SUBJECT_LINE_INDEX;
    const isFollowedByBlankLine = lines[index + 1]?.trim() === '';

    return isBodyLine && isFollowedByBlankLine;
  };

  return lines.filter(isDetachedTrailerPlace).map(parseTrailerLine).filter(Boolean);
};

/**
 * Parameters of {@link hasTrailerKey}.
 *
 * @typedef {object} HasTrailerKeyParams
 * @property {Trailer | null} trailer - Trailer to check, or null for a line that is not one.
 * @property {string} key - Expected token, such as `Refs`, matched whatever its case, as git does.
 */

/**
 * Tells whether a trailer has the given key, whatever its case, as git compares them.
 *
 * @param {HasTrailerKeyParams} params - The trailer and the key.
 * @returns {boolean} False when the trailer is missing or either key is not a string.
 * @example
 * hasTrailerKey({ trailer: { key: 'refs', value: 'PEDAL-47' }, key: 'Refs' }); // true
 */
export const hasTrailerKey = ({ trailer, key }) => {
  if (typeof trailer?.key !== 'string') return false;
  if (typeof key !== 'string') return false;

  return trailer.key.toLowerCase() === key.toLowerCase();
};

/**
 * Parameters of {@link hasTrailerLine}.
 *
 * @typedef {object} HasTrailerLineParams
 * @property {string} message - Commit message.
 * @property {string} key - Token of the trailer, such as `Refs`, matched whatever its case, as
 *   git does.
 */

/**
 * Tells whether any line of a commit message starts like a trailer with the given key, inside
 * or outside the trailer paragraph.
 *
 * @param {HasTrailerLineParams} params - The message and the key.
 * @returns {boolean} False when the message or the key is not a string.
 */
export const hasTrailerLine = ({ message, key }) => {
  if (typeof message !== 'string') return false;

  return message
    .split('\n')
    .map(parseTrailerLine)
    .some((trailer) => hasTrailerKey({ trailer, key }));
};

/**
 * Parameters of {@link addTrailer}.
 *
 * @typedef {object} AddTrailerParams
 * @property {string} message - Content of the message file, possibly with the comments of the
 *   commit template.
 * @property {string} trailer - Trailer to add, such as `Refs: PEDAL-47`.
 */

/**
 * Adds a trailer at the start of the last paragraph of a commit message, with
 * `git interpret-trailers`: above the `Co-Authored-By` trailer when there is one, or in a new
 * paragraph. An empty message gets an empty subject line and a blank line above the trailer.
 *
 * @param {AddTrailerParams} params - The message and the trailer.
 * @returns {string} The message with the trailer, or the message unchanged when it or the
 *   trailer is not a string, or when git fails.
 */
export const addTrailer = ({ message, trailer }) => {
  if (typeof message !== 'string') return message;
  if (typeof trailer !== 'string') return message;
  if (!hasMessageContent(message)) return `${EMPTY_MESSAGE_PREFIX}${trailer}\n${message}`;

  const options = ['--where', 'start', '--trailer', trailer];

  return interpretTrailers({ options, message }) ?? message;
};
