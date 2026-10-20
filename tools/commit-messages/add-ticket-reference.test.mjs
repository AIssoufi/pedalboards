import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addTicketReference } from './add-ticket-reference.mjs';

const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';
const BRANCH = 'PEDAL-47';

describe('addTicketReference', () => {
  it('adds the trailer of the branch to a message given with -m', () => {
    assert.equal(
      addTicketReference({ message: 'feat: add a pedal\n', source: 'message', branch: BRANCH }),
      'feat: add a pedal\n\nRefs: PEDAL-47\n',
    );
  });

  it('adds the trailer above Co-Authored-By, in the last paragraph', () => {
    const message = `feat: add a pedal\n\nSome body.\n\n${CO_AUTHOR}\n`;

    assert.equal(
      addTicketReference({ message, source: 'message', branch: BRANCH }),
      `feat: add a pedal\n\nSome body.\n\nRefs: PEDAL-47\n${CO_AUTHOR}\n`,
    );
  });

  it('adds the trailer to the empty message of the editor, above the comments', () => {
    const template = '\n# Please enter the commit message for your changes.\n';

    assert.equal(
      addTicketReference({ message: template, branch: BRANCH }),
      `\n\nRefs: PEDAL-47\n${template}`,
    );
  });

  it('adds the trailer to a message from a template or a squash merge', () => {
    const message = 'feat: add a pedal\n';
    const expected = 'feat: add a pedal\n\nRefs: PEDAL-47\n';

    assert.equal(addTicketReference({ message, source: 'template', branch: BRANCH }), expected);
    assert.equal(addTicketReference({ message, source: 'squash', branch: BRANCH }), expected);
  });

  it('adds the trailer when amending a commit without one', () => {
    assert.equal(
      addTicketReference({ message: 'fix: x\n', source: 'commit', branch: BRANCH }),
      'fix: x\n\nRefs: PEDAL-47\n',
    );
  });

  it('never adds a second Refs when the trailers already have one', () => {
    const message = `feat: add a pedal\n\nRefs: PEDAL-46\n${CO_AUTHOR}\n`;

    assert.equal(addTicketReference({ message, source: 'message', branch: BRANCH }), message);
  });

  it('never adds a second Refs when one is outside the last paragraph', () => {
    const message = `feat: add a pedal\n\nRefs: PEDAL-20\n\n${CO_AUTHOR}\n`;

    assert.equal(addTicketReference({ message, source: 'commit', branch: BRANCH }), message);
  });

  it('never adds a second Refs written in another case', () => {
    const message = 'feat: add a pedal\n\nrefs: PEDAL-47\n';

    assert.equal(addTicketReference({ message, branch: BRANCH }), message);
  });

  it('leaves a merge commit as it is', () => {
    const message = "Merge branch 'master' into PEDAL-47\n";

    assert.equal(addTicketReference({ message, source: 'merge', branch: BRANCH }), message);
  });

  it('leaves a fixup! or squash! commit as it is', () => {
    const fixup = 'fixup! feat: add a pedal\n';
    const squash = 'squash! feat: add a pedal\n';

    const params = { source: 'message', branch: BRANCH };

    assert.equal(addTicketReference({ ...params, message: fixup }), fixup);
    assert.equal(addTicketReference({ ...params, message: squash }), squash);
  });

  it('leaves the message as it is on a branch that is not a ticket', () => {
    const message = 'feat: add a pedal\n';

    assert.equal(addTicketReference({ message, branch: 'master' }), message);
    assert.equal(addTicketReference({ message, branch: 'PEDAL-47-fix' }), message);
    assert.equal(addTicketReference({ message, branch: 'feature/PEDAL-47' }), message);
  });

  it('leaves the message as it is on a detached HEAD, such as during a rebase', () => {
    const message = 'feat: add a pedal\n';

    assert.equal(addTicketReference({ message, branch: '' }), message);
    assert.equal(addTicketReference({ message }), message);
  });

  it('leaves the message as it is when the branch is not a string', () => {
    const message = 'feat: add a pedal\n';

    assert.equal(addTicketReference({ message, branch: null }), message);
    assert.equal(addTicketReference({ message, branch: 47 }), message);
  });

  it('uses the branch of another ticket key', () => {
    assert.equal(
      addTicketReference({ message: 'feat: x\n', branch: 'ISF-45', ticketKey: 'ISF' }),
      'feat: x\n\nRefs: ISF-45\n',
    );
  });

  it('returns a non-string message as it is', () => {
    assert.equal(addTicketReference({ message: undefined, branch: BRANCH }), undefined);
    assert.equal(addTicketReference({ message: null, branch: BRANCH }), null);
  });
});
