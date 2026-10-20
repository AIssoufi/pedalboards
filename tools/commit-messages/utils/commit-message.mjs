// Predicates on the text of a commit message, as git writes it in the file given to the hooks

// Start of the comment lines that git adds to the message file and strips from the commit
const COMMENT_PREFIX = '#';
// Line after which `git commit --verbose` shows the diff, which is not part of the message
const SCISSORS_LINE = `${COMMENT_PREFIX} ------------------------ >8 ------------------------`;
// Subject of the commits that `git rebase --autosquash` folds into an earlier one
const AUTOSQUASH_SUBJECT_PATTERN = /^(fixup|squash)! /;
// Sign-off of a GitHub bot, such as `Signed-off-by: dependabot[bot] <support@github.com>`
const BOT_SIGN_OFF_PATTERN = /^Signed-off-by: .*\[bot\]/im;
// Header of the release commits of release-please, such as `chore(master): release 1.2.0` or
// `chore(master): release pedalboards 1.2.0`: the header ends with the version, which tells them
// from a human `chore`
const RELEASE_HEADER_PATTERN = /^chore(\([^)]*\))?: release (\S+ )?v?\d+\.\d+\.\d+(-\S+)?(\r?\n|$)/;

/**
 * Tells whether a line of the message file is text written by the author, neither blank nor a
 * comment of git.
 *
 * @param {string} line - One line of the message file.
 * @returns {boolean} True for a line of text.
 */
const isTextLine = (line) => {
  const isBlank = line.trim() === '';
  const isComment = line.startsWith(COMMENT_PREFIX);

  return !isBlank && !isComment;
};

/**
 * Tells whether a commit message has text of its own, outside the comment lines and the diff
 * that git adds to the file of the message.
 *
 * @param {string} message - Content of the message file.
 * @returns {boolean} False for an empty message, a non-string or a template made of comments only.
 */
export const hasMessageContent = (message) => {
  if (typeof message !== 'string') return false;

  const [editableText] = message.split(SCISSORS_LINE);

  return editableText.split('\n').some(isTextLine);
};

/**
 * Tells whether a commit is a `fixup!` or `squash!` commit, which `git rebase --autosquash`
 * folds into the commit it names.
 *
 * @param {string} message - Commit message.
 * @returns {boolean} False for any other message or a non-string.
 */
export const isAutosquashCommit = (message) => {
  if (typeof message !== 'string') return false;

  return AUTOSQUASH_SUBJECT_PATTERN.test(message);
};

/**
 * Tells whether a commit comes from a bot: a commit signed off by a GitHub bot, such as
 * Dependabot, or a release commit of release-please.
 *
 * @param {string} message - Commit message.
 * @returns {boolean} False for any other message or a non-string.
 */
export const isBotCommit = (message) => {
  if (typeof message !== 'string') return false;

  const isSignedOffByBot = BOT_SIGN_OFF_PATTERN.test(message);
  const isReleaseCommit = RELEASE_HEADER_PATTERN.test(message);

  return isSignedOffByBot || isReleaseCommit;
};
