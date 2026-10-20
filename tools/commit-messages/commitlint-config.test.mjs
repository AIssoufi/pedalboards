import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { before, describe, it } from 'node:test';

import lint from '@commitlint/lint';
import load from '@commitlint/load';

const ROOT_DIRECTORY = fileURLToPath(new URL('../../', import.meta.url));
const COMMIT_CONFIG_FILE = 'commitlint.config.mjs';
const PULL_REQUEST_TITLE_CONFIG_FILE = 'tools/commit-messages/pull-request-title.config.mjs';
const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';
const MAX_LINE_LENGTH = 100;

/**
 * Loads a commitlint configuration file of the repository, as the command line does.
 *
 * @param {string} file - Path of the configuration from the root of the repository.
 * @returns {Promise<(message: string) => Promise<import('@commitlint/types').LintOutcome>>}
 *   A function that lints a message with that configuration.
 */
const loadLinter = async (file) => {
  const config = await load({}, { cwd: ROOT_DIRECTORY, file });
  const options = {
    parserOpts: config.parserPreset?.parserOpts,
    plugins: config.plugins,
    ignores: config.ignores,
    defaultIgnores: config.defaultIgnores,
    helpUrl: config.helpUrl,
  };

  return (message) => lint(message, config.rules, options);
};

const errorNames = (outcome) => outcome.errors.map((error) => error.name);

describe('commitlint configuration of the commits', () => {
  let lintCommit;

  before(async () => {
    lintCommit = await loadLinter(COMMIT_CONFIG_FILE);
  });

  it('accepts a conventional commit with Refs above Co-Authored-By', async () => {
    const outcome = await lintCommit(
      `feat(cms): add a pedal\n\nSome body.\n\nRefs: PEDAL-47\n${CO_AUTHOR}\n`,
    );

    assert.deepEqual(errorNames(outcome), []);
    assert.equal(outcome.valid, true);
  });

  it('accepts the older layout, with a blank line after Refs', async () => {
    const outcome = await lintCommit(`docs: explain a pedal\n\nRefs: PEDAL-20\n\n${CO_AUTHOR}\n`);

    assert.equal(outcome.valid, true);
  });

  it('refuses a commit without a Refs trailer', async () => {
    const outcome = await lintCommit(`feat: add a pedal\n\n${CO_AUTHOR}\n`);

    assert.equal(outcome.valid, false);
    assert.deepEqual(errorNames(outcome), ['ticket-reference-exists']);
  });

  it('refuses a commit whose only reference is in the subject', async () => {
    const outcome = await lintCommit('feat: add a pedal for PEDAL-47\n');

    assert.deepEqual(errorNames(outcome), ['ticket-reference-exists']);
  });

  it('refuses a commit that is not conventional', async () => {
    const outcome = await lintCommit('Add a pedal\n\nRefs: PEDAL-47\n');

    assert.deepEqual(errorNames(outcome).sort(), ['subject-empty', 'type-empty']);
  });

  it(`accepts lines of ${MAX_LINE_LENGTH} characters and refuses longer ones`, async () => {
    const header = (length) => `feat: ${'a'.repeat(length - 'feat: '.length)}`;
    const bodyLine = (length) => 'b'.repeat(length);
    const message = ({ headerLength, bodyLength }) =>
      `${header(headerLength)}\n\n${bodyLine(bodyLength)}\n\nRefs: PEDAL-47\n`;

    const atLimit = await lintCommit(
      message({ headerLength: MAX_LINE_LENGTH, bodyLength: MAX_LINE_LENGTH }),
    );
    const aboveLimit = await lintCommit(
      message({ headerLength: MAX_LINE_LENGTH + 1, bodyLength: MAX_LINE_LENGTH + 1 }),
    );

    assert.deepEqual(errorNames(atLimit), []);
    assert.deepEqual(errorNames(aboveLimit).sort(), ['body-max-line-length', 'header-max-length']);
  });

  it('ignores a merge commit', async () => {
    const outcome = await lintCommit('Merge pull request #48 from AIssoufi/PEDAL-32\n\nA title\n');

    assert.equal(outcome.valid, true);
  });

  it('ignores a merge of a branch', async () => {
    const outcome = await lintCommit("Merge branch 'master' into PEDAL-47\n");

    assert.equal(outcome.valid, true);
  });

  it('ignores a commit of Dependabot, which is not conventional', async () => {
    const outcome = await lintCommit(
      'Bump pbkdf2 from 3.0.17 to 3.1.7 in /pedalboards-frontend\n\n' +
        'Bumps [pbkdf2](https://github.com/browserify/pbkdf2) from 3.0.17 to 3.1.7.\n\n' +
        '---\nupdated-dependencies:\n- dependency-name: pbkdf2\n...\n\n' +
        'Signed-off-by: dependabot[bot] <support@github.com>\n',
    );

    assert.equal(outcome.valid, true);
  });

  it('ignores a release commit of release-please', async () => {
    const outcome = await lintCommit('chore(master): release 1.2.0\n');

    assert.equal(outcome.valid, true);
  });

  it('refuses a chore about a release that has no reference', async () => {
    const outcome = await lintCommit('chore: release the beta to staging\n');

    assert.deepEqual(errorNames(outcome), ['ticket-reference-exists']);
  });

  it('ignores a fixup! commit, folded before the merge', async () => {
    const outcome = await lintCommit('fixup! feat: add a pedal\n');

    assert.equal(outcome.valid, true);
  });
});

describe('commitlint configuration of the pull request titles', () => {
  let lintTitle;

  before(async () => {
    lintTitle = await loadLinter(PULL_REQUEST_TITLE_CONFIG_FILE);
  });

  it('accepts a conventional title without a ticket reference', async () => {
    const outcome = await lintTitle('feat: enforce conventional commits with a ticket reference');

    assert.deepEqual(errorNames(outcome), []);
  });

  it('refuses a title that is not conventional', async () => {
    const outcome = await lintTitle('Enforce conventional commits');

    assert.equal(outcome.valid, false);
    assert.deepEqual(errorNames(outcome).sort(), ['subject-empty', 'type-empty']);
  });

  it('refuses an unknown type', async () => {
    const outcome = await lintTitle('feature: enforce conventional commits');

    assert.deepEqual(errorNames(outcome), ['type-enum']);
  });

  it('refuses a title that commits would ignore', async () => {
    const merge = await lintTitle('Merge branch master into PEDAL-47');
    const fixup = await lintTitle('fixup! feat: add a pedal');

    assert.equal(merge.valid, false);
    assert.equal(fixup.valid, false);
  });

  it(`refuses a title over ${MAX_LINE_LENGTH} characters`, async () => {
    const outcome = await lintTitle(`feat: ${'a'.repeat(MAX_LINE_LENGTH)}`);

    assert.deepEqual(errorNames(outcome), ['header-max-length']);
  });
});
