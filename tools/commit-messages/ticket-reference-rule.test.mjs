import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ticketReferenceExists } from './ticket-reference-rule.mjs';

const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';
const WITH_REFERENCE = { raw: `feat: add a pedal\n\nRefs: PEDAL-47\n${CO_AUTHOR}\n` };
const WITHOUT_REFERENCE = { raw: `feat: add a pedal\n\n${CO_AUTHOR}\n` };

describe('ticketReferenceExists', () => {
  it('accepts a message with a Refs trailer', () => {
    const [isValid] = ticketReferenceExists(WITH_REFERENCE);

    assert.equal(isValid, true);
  });

  it('accepts the older layout, with a blank line after Refs', () => {
    const [isValid] = ticketReferenceExists({
      raw: `feat: add a pedal\n\nRefs: PEDAL-20\n\n${CO_AUTHOR}\n`,
    });

    assert.equal(isValid, true);
  });

  it('refuses a message without a Refs trailer, and says how to write it', () => {
    const [isValid, error] = ticketReferenceExists(WITHOUT_REFERENCE, 'always');

    assert.equal(isValid, false);
    assert.equal(
      error,
      'the message must end with a "Refs: PEDAL-<number>" trailer, ' +
        'in its last paragraph next to Co-Authored-By',
    );
  });

  it('refuses a ticket mentioned in the body only', () => {
    const [isValid] = ticketReferenceExists({ raw: 'feat: add a pedal\n\nFor PEDAL-47.\n' });

    assert.equal(isValid, false);
  });

  it('checks the tickets of the given key', () => {
    const [isValid, error] = ticketReferenceExists(WITH_REFERENCE, 'always', 'ISF');

    assert.equal(isValid, false);
    assert.match(error, /"Refs: ISF-<number>"/);
  });

  it('forbids a reference with `never`', () => {
    assert.deepEqual(ticketReferenceExists(WITH_REFERENCE, 'never'), [
      false,
      'the message must not reference a PEDAL ticket',
    ]);
    assert.equal(ticketReferenceExists(WITHOUT_REFERENCE, 'never')[0], true);
  });

  it('refuses an empty or missing raw message', () => {
    assert.equal(ticketReferenceExists({ raw: '' })[0], false);
    assert.equal(ticketReferenceExists({ raw: null })[0], false);
    assert.equal(ticketReferenceExists({})[0], false);
    assert.equal(ticketReferenceExists(undefined)[0], false);
  });
});
