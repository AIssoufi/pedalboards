import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addTrailer,
  hasTrailerKey,
  hasTrailerLine,
  parseDetachedTrailers,
  parseTrailers,
} from './trailers.mjs';

const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';
// A PATH without git, so that `git interpret-trailers` cannot run
const PATH_WITHOUT_GIT = '/path-without-git';

// Runs a function while git cannot be found, then restores the PATH
const withoutGit = (run) => {
  const savedPath = process.env.PATH;
  process.env.PATH = PATH_WITHOUT_GIT;

  try {
    return run();
  } finally {
    process.env.PATH = savedPath;
  }
};

describe('parseTrailers', () => {
  it('reads the trailers of the last paragraph', () => {
    const message = `feat: add a pedal\n\nSome body.\n\nRefs: PEDAL-47\n${CO_AUTHOR}\n`;

    assert.deepEqual(parseTrailers(message), [
      { key: 'Refs', value: 'PEDAL-47' },
      { key: 'Co-Authored-By', value: 'Claude <noreply@anthropic.com>' },
    ]);
  });

  it('does not read a trailer followed by a blank line', () => {
    const message = `feat: add a pedal\n\nRefs: PEDAL-20\n\n${CO_AUTHOR}\n`;

    assert.deepEqual(parseTrailers(message), [
      { key: 'Co-Authored-By', value: 'Claude <noreply@anthropic.com>' },
    ]);
  });

  it('does not read the subject as a trailer', () => {
    assert.deepEqual(parseTrailers('Refs: PEDAL-47\n'), []);
  });

  it('skips the comment lines of the commit template', () => {
    const message = 'feat: add a pedal\n\nRefs: PEDAL-47\n# Please enter the commit message.\n';

    assert.deepEqual(parseTrailers(message), [{ key: 'Refs', value: 'PEDAL-47' }]);
  });

  it('reads past a `---` line of the body, unlike an email', () => {
    const message = 'feat: add a pedal\n\n---\nnot a divider\n\nRefs: PEDAL-47\n';

    assert.deepEqual(parseTrailers(message), [{ key: 'Refs', value: 'PEDAL-47' }]);
  });

  it('returns no trailer for a message without any', () => {
    assert.deepEqual(parseTrailers('feat: add a pedal\n\nSome body.\n'), []);
  });

  it('returns no trailer for a non-string', () => {
    assert.deepEqual(parseTrailers(undefined), []);
  });

  it('returns no trailer when git cannot run', () => {
    const trailers = withoutGit(() => parseTrailers('feat: add a pedal\n\nRefs: PEDAL-47\n'));

    assert.deepEqual(trailers, []);
  });
});

describe('parseDetachedTrailers', () => {
  it('reads a trailer line followed by a blank line', () => {
    const message = 'feat: add a pedal\n\nRefs: PEDAL-20\n\nSome body.\n';

    assert.deepEqual(parseDetachedTrailers(message), [{ key: 'Refs', value: 'PEDAL-20' }]);
  });

  it('reads both trailers of the older layout, the last line included', () => {
    const message = `feat: add a pedal\n\nRefs: PEDAL-20\n\n${CO_AUTHOR}\n`;

    assert.deepEqual(parseDetachedTrailers(message), [
      { key: 'Refs', value: 'PEDAL-20' },
      { key: 'Co-Authored-By', value: 'Claude <noreply@anthropic.com>' },
    ]);
  });

  it('reads the last line of the message', () => {
    assert.deepEqual(parseDetachedTrailers('feat: add a pedal\n\nRefs: PEDAL-20\n'), [
      { key: 'Refs', value: 'PEDAL-20' },
    ]);
  });

  it('never reads the subject line', () => {
    assert.deepEqual(parseDetachedTrailers('Refs: PEDAL-20\n\nbody\n'), []);
  });

  it('ignores a trailer line followed by another line', () => {
    assert.deepEqual(parseDetachedTrailers(`feat: x\n\nRefs: PEDAL-20\n${CO_AUTHOR}`), []);
  });

  it('returns no trailer for a non-string', () => {
    assert.deepEqual(parseDetachedTrailers(null), []);
  });
});

describe('hasTrailerKey', () => {
  it('is true for a trailer with the key', () => {
    const trailer = { key: 'Refs', value: 'PEDAL-47' };

    assert.equal(hasTrailerKey({ trailer, key: 'Refs' }), true);
  });

  it('matches the key whatever its case, as git does', () => {
    const trailer = { key: 'REFS', value: 'PEDAL-47' };

    assert.equal(hasTrailerKey({ trailer, key: 'refs' }), true);
  });

  it('is false for another key, even one that starts the same way', () => {
    const trailer = { key: 'References', value: 'PEDAL-47' };

    assert.equal(hasTrailerKey({ trailer, key: 'Refs' }), false);
  });

  it('is false for a line that is not a trailer', () => {
    assert.equal(hasTrailerKey({ trailer: null, key: 'Refs' }), false);
    assert.equal(hasTrailerKey({ trailer: undefined, key: 'Refs' }), false);
  });

  it('is false for a key that is not a string', () => {
    const trailer = { key: 'Refs', value: 'PEDAL-47' };

    assert.equal(hasTrailerKey({ trailer, key: undefined }), false);
    assert.equal(hasTrailerKey({ trailer: { key: 42, value: 'x' }, key: 'Refs' }), false);
  });
});

describe('hasTrailerLine', () => {
  it('finds the key in the trailers', () => {
    assert.equal(hasTrailerLine({ message: 'feat: x\n\nRefs: PEDAL-1\n', key: 'Refs' }), true);
  });

  it('finds the key outside the trailer paragraph', () => {
    const message = `feat: x\n\nRefs: PEDAL-1\n\nSome body.\n\n${CO_AUTHOR}\n`;

    assert.equal(hasTrailerLine({ message, key: 'Refs' }), true);
  });

  it('matches the key whatever its case, as git does', () => {
    assert.equal(hasTrailerLine({ message: 'feat: x\n\nrefs: PEDAL-1\n', key: 'Refs' }), true);
  });

  it('does not match a key that only starts the same way', () => {
    const message = 'feat: x\n\nReferences: PEDAL-1\n';

    assert.equal(hasTrailerLine({ message, key: 'Refs' }), false);
  });

  it('is false without the key', () => {
    assert.equal(hasTrailerLine({ message: `feat: x\n\n${CO_AUTHOR}\n`, key: 'Refs' }), false);
  });

  it('is false for a non-string message or key', () => {
    assert.equal(hasTrailerLine({ message: undefined, key: 'Refs' }), false);
    assert.equal(hasTrailerLine({ message: 'Refs: PEDAL-1', key: undefined }), false);
  });
});

describe('addTrailer', () => {
  it('adds the trailer in a new paragraph after the subject', () => {
    assert.equal(
      addTrailer({ message: 'feat: add a pedal\n', trailer: 'Refs: PEDAL-47' }),
      'feat: add a pedal\n\nRefs: PEDAL-47\n',
    );
  });

  it('adds the trailer above Co-Authored-By, in the same paragraph', () => {
    assert.equal(
      addTrailer({ message: `feat: add a pedal\n\n${CO_AUTHOR}\n`, trailer: 'Refs: PEDAL-47' }),
      `feat: add a pedal\n\nRefs: PEDAL-47\n${CO_AUTHOR}\n`,
    );
  });

  it('adds the trailer above the comments of the commit template', () => {
    const message = 'feat: add a pedal\n\n# Please enter the commit message.\n';

    assert.equal(
      addTrailer({ message, trailer: 'Refs: PEDAL-47' }),
      'feat: add a pedal\n\nRefs: PEDAL-47\n\n# Please enter the commit message.\n',
    );
  });

  it('leaves an empty subject line above the trailer of an empty message', () => {
    assert.equal(addTrailer({ message: '', trailer: 'Refs: PEDAL-47' }), '\n\nRefs: PEDAL-47\n');
  });

  it('keeps the comments of a template without text below the trailer', () => {
    const template = '\n# Please enter the commit message.\n';

    assert.equal(
      addTrailer({ message: template, trailer: 'Refs: PEDAL-47' }),
      `\n\nRefs: PEDAL-47\n${template}`,
    );
  });

  it('returns a non-string message as it is', () => {
    assert.equal(addTrailer({ message: undefined, trailer: 'Refs: PEDAL-47' }), undefined);
    assert.equal(addTrailer({ message: null, trailer: 'Refs: PEDAL-47' }), null);
    assert.equal(addTrailer({ message: 42, trailer: 'Refs: PEDAL-47' }), 42);
  });

  it('returns the message as it is when the trailer is not a string', () => {
    assert.equal(addTrailer({ message: 'feat: x\n', trailer: undefined }), 'feat: x\n');
    assert.equal(addTrailer({ message: '', trailer: null }), '');
  });

  it('returns the message as it is when git cannot run', () => {
    const message = 'feat: add a pedal\n';

    assert.equal(withoutGit(() => addTrailer({ message, trailer: 'Refs: PEDAL-47' })), message);
  });
});
