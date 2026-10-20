import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  describeStop,
  findLocalScriptUrls,
  hasStopped,
  isHtmlType,
  isJavaScriptType,
} from './utils.mjs';

const PAGE_URL = 'http://127.0.0.1:5173/';

// Lists the local scripts of an HTML snippet served at PAGE_URL
const findScripts = html => findLocalScriptUrls({ html, pageUrl: PAGE_URL });

describe('findLocalScriptUrls', () => {
  it('lists the scripts of a Vite page in their order', () => {
    const html = [
      '<script type="module" src="/@vite/client"></script>',
      '<script type="module">import RefreshRuntime from "/@react-refresh"</script>',
      '<script type="module" src="/src/index.jsx"></script>',
    ].join('\n');

    assert.deepEqual(findScripts(html), [
      'http://127.0.0.1:5173/@vite/client',
      'http://127.0.0.1:5173/src/index.jsx',
    ]);
  });

  it('reads a classic script, single quotes, no quotes and upper case tags', () => {
    const html = [
      '<script src="/static/js/bundle.js"></script>',
      "<script src='/single.js'></script>",
      '<script defer src=/unquoted.js></script>',
      '<SCRIPT SRC="/upper.js"></SCRIPT>',
    ].join('');

    assert.deepEqual(findScripts(html), [
      'http://127.0.0.1:5173/static/js/bundle.js',
      'http://127.0.0.1:5173/single.js',
      'http://127.0.0.1:5173/unquoted.js',
      'http://127.0.0.1:5173/upper.js',
    ]);
  });

  it('reads the source when it comes before the other attributes', () => {
    assert.deepEqual(
      findScripts('<script src="/first.js" type="module"></script>'),
      ['http://127.0.0.1:5173/first.js'],
    );
  });

  it('resolves a relative source against the URL of the page', () => {
    const html = '<script src="./main.js"></script><script src="assets/app.js"></script>';

    assert.deepEqual(
      findLocalScriptUrls({ html, pageUrl: 'http://127.0.0.1:5173/app/' }),
      ['http://127.0.0.1:5173/app/main.js', 'http://127.0.0.1:5173/app/assets/app.js'],
    );
  });

  it('leaves out the scripts of another origin, port or protocol', () => {
    const html = [
      '<script src="https://cdn.example.com/lib.js"></script>',
      '<script src="//cdn.example.com/protocol-relative.js"></script>',
      '<script src="http://127.0.0.1:3000/other-port.js"></script>',
      '<script src="https://127.0.0.1:5173/other-protocol.js"></script>',
      '<script src="/local.js"></script>',
    ].join('');

    assert.deepEqual(findScripts(html), ['http://127.0.0.1:5173/local.js']);
  });

  it('ignores a data-src attribute and the src of other tags', () => {
    const html = [
      '<script data-src="/lazy.js"></script>',
      '<img src="/logo.png">',
      '<link rel="modulepreload" href="/chunk.js">',
    ].join('');

    assert.deepEqual(findScripts(html), []);
  });

  it('leaves out empty sources and sources that are not URLs', () => {
    const html = [
      '<script src=""></script>',
      '<script src="  "></script>',
      '<script src="http://[bad"></script>',
    ].join('');

    assert.deepEqual(findScripts(html), []);
  });

  it('returns an empty list for a page without scripts, an empty page or no page', () => {
    assert.deepEqual(findScripts('<html><body><div id="root"></div></body></html>'), []);
    assert.deepEqual(findScripts(''), []);
    assert.deepEqual(findScripts(undefined), []);
    assert.deepEqual(findScripts(null), []);
  });

  it('throws when the URL of the page is not a URL', () => {
    assert.throws(
      () => findLocalScriptUrls({ html: '<script src="/a.js"></script>', pageUrl: 'not a url' }),
      TypeError,
    );
  });
});

describe('isJavaScriptType', () => {
  it('accepts the JavaScript media types, with or without parameters', () => {
    assert.equal(isJavaScriptType('text/javascript'), true);
    assert.equal(isJavaScriptType('application/javascript'), true);
    assert.equal(isJavaScriptType('text/javascript; charset=utf-8'), true);
    assert.equal(isJavaScriptType('Application/JavaScript;charset=UTF-8'), true);
  });

  it('rejects the other media types and a type that only starts like JavaScript', () => {
    assert.equal(isJavaScriptType('text/html'), false);
    assert.equal(isJavaScriptType('text/css'), false);
    assert.equal(isJavaScriptType('application/json'), false);
    assert.equal(isJavaScriptType('text/javascriptx'), false);
  });

  it('rejects an empty or missing header', () => {
    assert.equal(isJavaScriptType(''), false);
    assert.equal(isJavaScriptType(undefined), false);
    assert.equal(isJavaScriptType(null), false);
  });
});

describe('isHtmlType', () => {
  it('accepts the HTML media type, with or without parameters', () => {
    assert.equal(isHtmlType('text/html'), true);
    assert.equal(isHtmlType('text/html; charset=utf-8'), true);
    assert.equal(isHtmlType('TEXT/HTML'), true);
  });

  it('rejects the other media types and a type that only starts like HTML', () => {
    assert.equal(isHtmlType('text/plain'), false);
    assert.equal(isHtmlType('application/xhtml+xml'), false);
    assert.equal(isHtmlType('text/htmlx'), false);
  });

  it('rejects an empty or missing header', () => {
    assert.equal(isHtmlType(''), false);
    assert.equal(isHtmlType(undefined), false);
    assert.equal(isHtmlType(null), false);
  });
});

describe('hasStopped', () => {
  it('tells that a process without exit code or signal still runs', () => {
    assert.equal(hasStopped({ exitCode: null, signalCode: null }), false);
  });

  it('tells that a process that exited has stopped, with a zero or non-zero code', () => {
    assert.equal(hasStopped({ exitCode: 0, signalCode: null }), true);
    assert.equal(hasStopped({ exitCode: 1, signalCode: null }), true);
  });

  it('tells that a process stopped by a signal has stopped', () => {
    assert.equal(hasStopped({ exitCode: null, signalCode: 'SIGTERM' }), true);
  });
});

describe('describeStop', () => {
  it('gives the exit code of a process that exited, zero included', () => {
    assert.equal(describeStop({ exitCode: 0, signalCode: null }), 'exit code 0');
    assert.equal(describeStop({ exitCode: 1, signalCode: null }), 'exit code 1');
  });

  it('gives the signal of a process stopped by a signal', () => {
    assert.equal(describeStop({ exitCode: null, signalCode: 'SIGKILL' }), 'signal SIGKILL');
  });

  it('gives the signal when the process has both a signal and an exit code', () => {
    assert.equal(describeStop({ exitCode: 143, signalCode: 'SIGTERM' }), 'signal SIGTERM');
  });
});
