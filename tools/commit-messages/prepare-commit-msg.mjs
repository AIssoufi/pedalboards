// Git prepare-commit-msg hook: adds `Refs: <branch>` to a commit made on a ticket branch.
// Usage: node tools/commit-messages/prepare-commit-msg.mjs <message file> [source]
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

import { addTicketReference } from './add-ticket-reference.mjs';
import { TEXT_ENCODING } from './constants.mjs';

/**
 * Reads the name of the current branch.
 *
 * @returns {string} The short name of the branch, or an empty string on a detached HEAD, such
 *   as during a rebase, or when git fails.
 */
const getCurrentBranch = () => {
  const result = spawnSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
    encoding: TEXT_ENCODING,
  });
  const hasSucceeded = result.status === 0;

  return hasSucceeded ? result.stdout.trim() : '';
};

/**
 * Runs the hook on the message file that git gives. It never fails the commit: an error only
 * prints a warning, and commitlint checks the message afterwards.
 *
 * @param {string[]} args - Arguments of the hook: the message file, then the source.
 */
const run = ([messageFile, source = '']) => {
  try {
    const message = readFileSync(messageFile, TEXT_ENCODING);
    const branch = getCurrentBranch();
    const nextMessage = addTicketReference({ message, source, branch });

    if (nextMessage !== message) writeFileSync(messageFile, nextMessage, TEXT_ENCODING);
  } catch (error) {
    console.warn(`prepare-commit-msg: the ticket reference was not added (${error.message})`);
  }
};

run(process.argv.slice(2));
