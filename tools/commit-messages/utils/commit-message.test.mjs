import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasMessageContent, isAutosquashCommit, isBotCommit } from './commit-message.mjs';

const SCISSORS_LINE = '# ------------------------ >8 ------------------------';

describe('hasMessageContent', () => {
  it('is true for a message with a subject', () => {
    assert.equal(hasMessageContent('feat: add a pedal\n'), true);
  });

  it('is true for a message whose only text is in the body', () => {
    assert.equal(hasMessageContent('\nsome body\n'), true);
  });

  it('is false for an empty message', () => {
    assert.equal(hasMessageContent(''), false);
  });

  it('is false for blank lines only', () => {
    assert.equal(hasMessageContent('\n  \n\t\n'), false);
  });

  it('is false for a template made of comments only', () => {
    const template = '\n# Please enter the commit message.\n# On branch PEDAL-47\n';

    assert.equal(hasMessageContent(template), false);
  });

  it('ignores the diff below the scissors line of `git commit --verbose`', () => {
    const message = `\n# comment\n${SCISSORS_LINE}\ndiff --git a/file b/file\n+added line\n`;

    assert.equal(hasMessageContent(message), false);
  });

  it('is false for a non-string', () => {
    assert.equal(hasMessageContent(undefined), false);
    assert.equal(hasMessageContent(null), false);
  });
});

describe('isAutosquashCommit', () => {
  it('is true for a fixup! commit', () => {
    assert.equal(isAutosquashCommit('fixup! feat: add a pedal\n'), true);
  });

  it('is true for a squash! commit', () => {
    assert.equal(isAutosquashCommit('squash! feat: add a pedal\n'), true);
  });

  it('is false when fixup! is not at the start of the subject', () => {
    assert.equal(isAutosquashCommit('feat: fixup! the pedal\n'), false);
  });

  it('is false for a conventional commit', () => {
    assert.equal(isAutosquashCommit('fix: repair the pedal\n'), false);
  });

  it('is false for a non-string', () => {
    assert.equal(isAutosquashCommit(undefined), false);
  });
});

describe('isBotCommit', () => {
  it('is true for a commit signed off by Dependabot', () => {
    const message =
      'chore(deps): bump express from 4.18.2 to 4.19.2\n\n' +
      'Signed-off-by: dependabot[bot] <support@github.com>\n';

    assert.equal(isBotCommit(message), true);
  });

  it('is true for a release commit of release-please', () => {
    assert.equal(isBotCommit('chore(master): release 1.2.0\n'), true);
    assert.equal(isBotCommit('chore: release 2.0.0\n'), true);
    assert.equal(isBotCommit('chore(master): release pedalboards 1.2.0\n'), true);
    assert.equal(isBotCommit('chore(master): release v1.2.0\n'), true);
    assert.equal(isBotCommit('chore(master): release 1.2.0-beta.1\n'), true);
    assert.equal(isBotCommit('chore(master): release 1.2.0'), true);
    assert.equal(isBotCommit('chore(master): release 1.2.0\r\n\r\nNotes\r\n'), true);
  });

  it('is false for a chore commit that only mentions a release', () => {
    assert.equal(isBotCommit('chore: prepare the release notes\n'), false);
    assert.equal(isBotCommit('chore: released packages cleanup\n'), false);
    assert.equal(isBotCommit('chore: release the beta to staging\n'), false);
    assert.equal(isBotCommit('chore: release-please config\n'), false);
  });

  it('is false for a chore whose header goes on after the version', () => {
    assert.equal(isBotCommit('chore: release 1.2.0 to staging\n'), false);
    assert.equal(isBotCommit('chore: release the 2.0.0 changelog\n'), false);
    assert.equal(isBotCommit('chore(deps): release v1.2.0 hotfix to the beta users\n'), false);
  });

  it('is false for a release header without a whole version', () => {
    assert.equal(isBotCommit('chore: release 1.2\n'), false);
    assert.equal(isBotCommit('chore: release\n'), false);
  });

  it('is false for a commit signed off by a person', () => {
    assert.equal(isBotCommit('feat: add a pedal\n\nSigned-off-by: Ada <ada@example.com>\n'), false);
  });

  it('is false for a non-string', () => {
    assert.equal(isBotCommit(null), false);
  });
});
