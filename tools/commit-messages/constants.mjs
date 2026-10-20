// Constants shared by the commitlint configuration and the prepare-commit-msg hook

/** Key of the repository's GitHub autolink, which turns `PEDAL-47` into a link to issue 47. */
export const TICKET_KEY = 'PEDAL';

/** Key of the trailer that links a commit to its ticket: `Refs: PEDAL-47`. */
export const REFS_TRAILER_KEY = 'Refs';

/** Name of the commitlint rule that requires a reference to a ticket of the repository. */
export const TICKET_REFERENCE_RULE = 'ticket-reference-exists';

/** Levels of a commitlint rule: a disabled rule is not checked, an error fails the lint. */
export const RULE_LEVELS = { disabled: 0, error: 2 };

/** Conditions of a commitlint rule: `always` requires what it checks, `never` forbids it. */
export const RULE_CONDITIONS = { always: 'always', never: 'never' };

/** Encoding of the commit message file and of the output of git. */
export const TEXT_ENCODING = 'utf8';
