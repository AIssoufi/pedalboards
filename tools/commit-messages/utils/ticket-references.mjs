// Finds the references to the tickets of the repository in a commit message
import { REFS_TRAILER_KEY, TICKET_KEY } from '../constants.mjs';
import { hasTrailerKey, parseDetachedTrailers, parseTrailers } from './trailers.mjs';

// Separators of the tickets named by one trailer, such as `Refs: PEDAL-46, PEDAL-47`
const REFERENCE_SEPARATOR_PATTERN = /[\s,]+/;
// Number of a ticket: a positive integer without leading zeros
const TICKET_NUMBER_PATTERN = /^[1-9]\d*$/;

/**
 * Parameters of {@link isTicketId}.
 *
 * @typedef {object} IsTicketIdParams
 * @property {string} candidate - Text to check, such as a branch name or a trailer value.
 * @property {string} [ticketKey] - Key of the tickets, `PEDAL` by default.
 */

/**
 * Tells whether a text is the identifier of a ticket of the repository, such as `PEDAL-47`.
 *
 * @param {IsTicketIdParams} params - The text and the key of the tickets.
 * @returns {boolean} False for any other text, such as `PEDAL-47-fix`, `pedal-47` or `PEDAL-0`.
 * @example
 * isTicketId({ candidate: 'PEDAL-47' }); // true
 * isTicketId({ candidate: 'feature/PEDAL-47' }); // false
 */
export const isTicketId = ({ candidate, ticketKey = TICKET_KEY }) => {
  if (typeof candidate !== 'string') return false;

  const prefix = `${ticketKey}-`;
  if (!candidate.startsWith(prefix)) return false;

  return TICKET_NUMBER_PATTERN.test(candidate.slice(prefix.length));
};

/**
 * Parameters of {@link findTicketReferences}.
 *
 * @typedef {object} FindTicketReferencesParams
 * @property {string} message - Commit message.
 * @property {string} [ticketKey] - Key of the tickets, `PEDAL` by default.
 */

/**
 * Lists the tickets that the `Refs` trailers of a commit message name. It reads the trailers
 * of the last paragraph, as git does, and the older layout where a blank line follows the
 * `Refs` line.
 *
 * @param {FindTicketReferencesParams} params - The message and the key of the tickets.
 * @returns {string[]} The identifiers of the tickets, each once, in their order.
 * @example
 * findTicketReferences({ message: 'feat: add a pedal\n\nRefs: PEDAL-47' }); // ['PEDAL-47']
 */
export const findTicketReferences = ({ message, ticketKey = TICKET_KEY }) => {
  const isRefsTrailer = (trailer) => hasTrailerKey({ trailer, key: REFS_TRAILER_KEY });
  const isTicketOfRepository = (candidate) => isTicketId({ candidate, ticketKey });

  const references = [...parseTrailers(message), ...parseDetachedTrailers(message)]
    .filter(isRefsTrailer)
    .flatMap((trailer) => trailer.value.split(REFERENCE_SEPARATOR_PATTERN))
    .filter(isTicketOfRepository);

  return [...new Set(references)];
};
