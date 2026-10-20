// Adds the `Refs: PEDAL-<number>` trailer of the current branch to a commit message
import { REFS_TRAILER_KEY, TICKET_KEY } from './constants.mjs';
import { isAutosquashCommit } from './utils/commit-message.mjs';
import { isTicketId } from './utils/ticket-references.mjs';
import { addTrailer, hasTrailerLine } from './utils/trailers.mjs';

// Source given by git to prepare-commit-msg for a merge commit, which needs no reference
const MERGE_SOURCE = 'merge';

/**
 * Parameters of {@link addTicketReference}.
 *
 * @typedef {object} AddTicketReferenceParams
 * @property {string} message - Content of the message file given to the prepare-commit-msg hook.
 * @property {string} [source] - Source of the message given by git: `message`, `template`,
 *   `merge`, `squash`, `commit`, or empty when the editor opens on a new message.
 * @property {string} [branch] - Name of the current branch, empty on a detached HEAD.
 * @property {string} [ticketKey] - Key of the tickets, `PEDAL` by default.
 */

/**
 * Adds `Refs: <branch>` at the start of the trailers of a commit message made on a ticket
 * branch, such as `PEDAL-47`. The message stays as it is on any other branch, for a merge or
 * a `fixup!` commit, and when a line of the message already starts with `Refs:`.
 *
 * @param {AddTicketReferenceParams} params - The message, its source, the branch and the key.
 * @returns {string} The message to write back to the file.
 * @example
 * addTicketReference({ message: 'feat: add a pedal\n', branch: 'PEDAL-47' });
 * // 'feat: add a pedal\n\nRefs: PEDAL-47\n'
 */
export const addTicketReference = ({
  message,
  source = '',
  branch = '',
  ticketKey = TICKET_KEY,
}) => {
  if (typeof message !== 'string') return message;

  const isMergeCommit = source === MERGE_SOURCE;
  const isTicketBranch = isTicketId({ candidate: branch, ticketKey });
  const hasReference = hasTrailerLine({ message, key: REFS_TRAILER_KEY });
  const needsReference = isTicketBranch && !isMergeCommit && !isAutosquashCommit(message);

  if (!needsReference || hasReference) return message;

  return addTrailer({ message, trailer: `${REFS_TRAILER_KEY}: ${branch}` });
};
