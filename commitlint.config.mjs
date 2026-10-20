// Commitlint configuration: Conventional Commits, each naming its ticket in a `Refs` trailer.
// See the "Commit messages" section of the README.
import {
  RULE_CONDITIONS,
  RULE_LEVELS,
  TICKET_KEY,
  TICKET_REFERENCE_RULE,
} from './tools/commit-messages/constants.mjs';
import { ticketReferenceExists } from './tools/commit-messages/ticket-reference-rule.mjs';
import { isBotCommit } from './tools/commit-messages/utils/commit-message.mjs';

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  plugins: [{ rules: { [TICKET_REFERENCE_RULE]: ticketReferenceExists } }],
  rules: {
    [TICKET_REFERENCE_RULE]: [RULE_LEVELS.error, RULE_CONDITIONS.always, TICKET_KEY],
  },
  // On top of the default ignores (merge, revert, `fixup!` and `squash!` commits)
  ignores: [isBotCommit],
  helpUrl: 'https://github.com/AIssoufi/pedalboards#commit-messages',
};

export default config;
