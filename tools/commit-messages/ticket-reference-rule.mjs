// Commitlint rule that requires a `Refs: PEDAL-<number>` trailer in every commit message
import { REFS_TRAILER_KEY, RULE_CONDITIONS, TICKET_KEY } from './constants.mjs';
import { findTicketReferences } from './utils/ticket-references.mjs';

/**
 * Commitlint rule `ticket-reference-exists`: the message must name a ticket of the repository
 * in a `Refs` trailer, in its last paragraph next to `Co-Authored-By`.
 *
 * @param {import('@commitlint/types').Commit} parsed - Commit parsed by commitlint, whose `raw`
 *   field holds the whole message.
 * @param {'always' | 'never'} [when] - `always` requires a reference, `never` forbids it.
 * @param {string} [ticketKey] - Key of the tickets, `PEDAL` by default.
 * @returns {[boolean, string]} Whether the message is valid, and the error shown otherwise.
 * @example
 * ticketReferenceExists({ raw: 'feat: add a pedal\n\nRefs: PEDAL-47' }); // [true, '…']
 */
export const ticketReferenceExists = (
  parsed,
  when = RULE_CONDITIONS.always,
  ticketKey = TICKET_KEY,
) => {
  const hasRawMessage = typeof parsed?.raw === 'string';
  const message = hasRawMessage ? parsed.raw : '';
  const hasReference = findTicketReferences({ message, ticketKey }).length > 0;
  const isRequired = when === RULE_CONDITIONS.always;

  if (isRequired) {
    const error =
      `the message must end with a "${REFS_TRAILER_KEY}: ${ticketKey}-<number>" trailer, ` +
      'in its last paragraph next to Co-Authored-By';

    return [hasReference, error];
  }

  return [!hasReference, `the message must not reference a ${ticketKey} ticket`];
};
