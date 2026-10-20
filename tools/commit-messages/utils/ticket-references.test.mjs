import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findTicketReferences, isTicketId } from './ticket-references.mjs';

const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';

describe('isTicketId', () => {
  it('accepts a ticket of the repository', () => {
    assert.equal(isTicketId({ candidate: 'PEDAL-47' }), true);
  });

  it('accepts a ticket of another key', () => {
    assert.equal(isTicketId({ candidate: 'ISF-45', ticketKey: 'ISF' }), true);
  });

  it('refuses a ticket of another key', () => {
    assert.equal(isTicketId({ candidate: 'ISF-45' }), false);
  });

  it('refuses a key in another case', () => {
    assert.equal(isTicketId({ candidate: 'pedal-47' }), false);
  });

  it('refuses a branch that only contains a ticket', () => {
    assert.equal(isTicketId({ candidate: 'PEDAL-47-fix' }), false);
    assert.equal(isTicketId({ candidate: 'feature/PEDAL-47' }), false);
  });

  it('refuses a missing, zero or zero-padded number', () => {
    assert.equal(isTicketId({ candidate: 'PEDAL-' }), false);
    assert.equal(isTicketId({ candidate: 'PEDAL-0' }), false);
    assert.equal(isTicketId({ candidate: 'PEDAL-047' }), false);
  });

  it('refuses a base branch or an empty name', () => {
    assert.equal(isTicketId({ candidate: 'master' }), false);
    assert.equal(isTicketId({ candidate: '' }), false);
  });

  it('refuses a non-string', () => {
    assert.equal(isTicketId({ candidate: undefined }), false);
  });
});

describe('findTicketReferences', () => {
  it('finds the reference of the trailer paragraph', () => {
    const message = `feat: add a pedal\n\nRefs: PEDAL-47\n${CO_AUTHOR}\n`;

    assert.deepEqual(findTicketReferences({ message }), ['PEDAL-47']);
  });

  it('finds the reference of the older layout, followed by a blank line', () => {
    const message = `feat: add a pedal\n\nRefs: PEDAL-20\n\n${CO_AUTHOR}\n`;

    assert.deepEqual(findTicketReferences({ message }), ['PEDAL-20']);
  });

  it('reads the key whatever its case', () => {
    assert.deepEqual(findTicketReferences({ message: 'feat: x\n\nrefs: PEDAL-3\n' }), ['PEDAL-3']);
  });

  it('reads several tickets in one trailer, each once', () => {
    const message = 'feat: x\n\nRefs: PEDAL-46, PEDAL-47 PEDAL-46\n';

    assert.deepEqual(findTicketReferences({ message }), ['PEDAL-46', 'PEDAL-47']);
  });

  it('reads several Refs trailers', () => {
    const message = 'feat: x\n\nRefs: PEDAL-46\nRefs: PEDAL-47\n';

    assert.deepEqual(findTicketReferences({ message }), ['PEDAL-46', 'PEDAL-47']);
  });

  it('ignores the tickets of another key and the values that are not tickets', () => {
    const message = 'feat: x\n\nRefs: ISF-45, #47, PEDAL-47-fix\n';

    assert.deepEqual(findTicketReferences({ message }), []);
  });

  it('ignores a ticket named by another trailer or in the body', () => {
    const message = 'feat: x\n\nSee PEDAL-47 for the context.\n\nCloses: PEDAL-47\n';

    assert.deepEqual(findTicketReferences({ message }), []);
  });

  it('ignores a reference in the subject', () => {
    assert.deepEqual(findTicketReferences({ message: 'Refs: PEDAL-47\n' }), []);
  });

  it('finds the tickets of the given key', () => {
    const message = 'feat: x\n\nRefs: ISF-45\n';

    assert.deepEqual(findTicketReferences({ message, ticketKey: 'ISF' }), ['ISF-45']);
  });

  it('returns no ticket for a non-string', () => {
    assert.deepEqual(findTicketReferences({ message: undefined }), []);
  });
});
