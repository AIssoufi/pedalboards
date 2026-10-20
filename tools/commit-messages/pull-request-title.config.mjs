// Commitlint configuration of the pull request titles: the commit rules without the ticket
// reference, which the body of the pull request gives with `Closes #<number>`. A title is
// written by hand, so none is ignored, not even `Merge …` or `fixup! …`; the workflow skips the
// pull requests of bots.
import commitConfig from '../../commitlint.config.mjs';
import { RULE_LEVELS, TICKET_REFERENCE_RULE } from './constants.mjs';

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  ...commitConfig,
  rules: {
    ...commitConfig.rules,
    [TICKET_REFERENCE_RULE]: [RULE_LEVELS.disabled],
  },
  ignores: [],
  defaultIgnores: false,
};

export default config;
