import { REQUIRED_HEADERS } from './constants.mjs';
import { findMarkers, findMissingHeaders, parseHeadersRules } from './utils.mjs';

const MARKERS = ['redux-logger', 'prev state'];

describe('findMarkers', () => {
  it('lists each marker of each file, in the order of the files then of the markers', () => {
    const files = [
      { name: 'a.js', contents: 'console.log("prev state"); // redux-logger' },
      { name: 'b.js', contents: 'const clean = true;' },
      { name: 'c.js', contents: 'prev state' }
    ];

    expect(findMarkers({ files, markers: MARKERS })).toEqual([
      { file: 'a.js', marker: 'redux-logger' },
      { file: 'a.js', marker: 'prev state' },
      { file: 'c.js', marker: 'prev state' }
    ]);
  });

  it('returns an empty list when no file holds a marker', () => {
    const files = [{ name: 'a.js', contents: 'const store = createStore();' }];

    expect(findMarkers({ files, markers: MARKERS })).toEqual([]);
  });

  it('matches the case of the marker exactly', () => {
    const files = [{ name: 'a.js', contents: 'Redux-Logger PREV STATE' }];

    expect(findMarkers({ files, markers: MARKERS })).toEqual([]);
  });

  it('returns an empty list when the files or the markers are missing or empty', () => {
    const files = [{ name: 'a.js', contents: 'redux-logger' }];

    expect(findMarkers()).toEqual([]);
    expect(findMarkers({})).toEqual([]);
    expect(findMarkers({ files })).toEqual([]);
    expect(findMarkers({ markers: MARKERS })).toEqual([]);
    expect(findMarkers({ files: [], markers: MARKERS })).toEqual([]);
  });

  it('returns an empty list when the params, files or markers are null or not lists', () => {
    const files = [{ name: 'a.js', contents: 'redux-logger' }];

    expect(findMarkers(null)).toEqual([]);
    expect(findMarkers({ files: null, markers: MARKERS })).toEqual([]);
    expect(findMarkers({ files, markers: null })).toEqual([]);
    expect(findMarkers({ files: 'a.js', markers: 'redux-logger' })).toEqual([]);
  });

  it('skips blank and non-string markers, which would match every file', () => {
    const files = [{ name: 'a.js', contents: 'const a = 1;' }];

    expect(findMarkers({ files, markers: ['', '   ', null, 42] })).toEqual([]);
  });

  it('skips files without text and empty file entries', () => {
    const files = [
      { name: 'a.js' },
      { name: 'b.js', contents: null },
      undefined,
      null,
      { name: 'c.js', contents: 'redux-logger' }
    ];

    expect(findMarkers({ files, markers: MARKERS }))
      .toEqual([{ file: 'c.js', marker: 'redux-logger' }]);
  });
});

const HEADERS_FILE = `# Headers of every page
/*
  X-Frame-Options: DENY
  Content-Security-Policy-Report-Only: default-src 'self'; img-src https://a.example

/assets/*
\tCache-Control: public, max-age=31536000, immutable
`;

describe('parseHeadersRules', () => {
  it('reads each pattern with the names of its headers in lower case, in the order of the file', () => {
    expect(parseHeadersRules(HEADERS_FILE)).toEqual([
      { pattern: '/*', headers: ['x-frame-options', 'content-security-policy-report-only'] },
      { pattern: '/assets/*', headers: ['cache-control'] }
    ]);
  });

  it('keeps a pattern without headers and a pattern given twice', () => {
    expect(parseHeadersRules('/a\n/b\n  X-A: 1\n/a\n  X-B: 2')).toEqual([
      { pattern: '/a', headers: [] },
      { pattern: '/b', headers: ['x-a'] },
      { pattern: '/a', headers: ['x-b'] }
    ]);
  });

  it('skips blank lines, comments, header lines before any pattern and lines without a name', () => {
    const contents = '  X-Orphan: 1\n\n   \n# /comment\n/a\n  # X-Commented: 1\n  no colon\n  : no name\n';

    expect(parseHeadersRules(contents)).toEqual([{ pattern: '/a', headers: [] }]);
  });

  it('reads Windows line endings and spaces around the name', () => {
    expect(parseHeadersRules('/a\r\n  X-A : 1\r\n')).toEqual([{ pattern: '/a', headers: ['x-a'] }]);
  });

  it('returns an empty list for an empty text or a value that is not a string', () => {
    expect(parseHeadersRules('')).toEqual([]);
    expect(parseHeadersRules()).toEqual([]);
    expect(parseHeadersRules(null)).toEqual([]);
    expect(parseHeadersRules(42)).toEqual([]);
  });
});

describe('findMissingHeaders', () => {
  const rules = parseHeadersRules(HEADERS_FILE);

  it('lists each required header that no rule of its pattern sets, as required', () => {
    const required = [
      { pattern: '/*', headers: ['X-Frame-Options', 'Strict-Transport-Security'] },
      { pattern: '/assets/*', headers: ['Cache-Control'] },
      { pattern: '/missing', headers: ['X-A'] }
    ];

    expect(findMissingHeaders({ rules, required })).toEqual([
      { pattern: '/*', header: 'Strict-Transport-Security' },
      { pattern: '/missing', header: 'X-A' }
    ]);
  });

  it('compares the names in any case and reads every rule of a pattern', () => {
    const splitRules = parseHeadersRules('/a\n  X-A: 1\n/a\n  x-b: 2');

    expect(findMissingHeaders({ rules: splitRules, required: [{ pattern: '/a', headers: ['x-a', 'X-B'] }] }))
      .toEqual([]);
  });

  it('does not take the headers of another pattern, even one that matches the same paths', () => {
    const required = [{ pattern: '/assets/*', headers: ['X-Frame-Options'] }];

    expect(findMissingHeaders({ rules, required }))
      .toEqual([{ pattern: '/assets/*', header: 'X-Frame-Options' }]);
  });

  it('lists every required header when the rules are missing, empty or not a list', () => {
    const required = [{ pattern: '/*', headers: ['X-A'] }];
    const missing = [{ pattern: '/*', header: 'X-A' }];

    expect(findMissingHeaders({ required })).toEqual(missing);
    expect(findMissingHeaders({ rules: [], required })).toEqual(missing);
    expect(findMissingHeaders({ rules: null, required })).toEqual(missing);
    expect(findMissingHeaders({ rules: [null, { pattern: '/*', headers: 'x-a' }], required }))
      .toEqual(missing);
  });

  it('returns an empty list when nothing is required, or the params are missing or null', () => {
    expect(findMissingHeaders()).toEqual([]);
    expect(findMissingHeaders(null)).toEqual([]);
    expect(findMissingHeaders({ rules })).toEqual([]);
    expect(findMissingHeaders({ rules, required: 'X-A' })).toEqual([]);
  });

  it('skips empty requirements and blank or non-string header names', () => {
    const required = [null, { pattern: '/*' }, { pattern: '/*', headers: ['', '  ', 42, null] }];

    expect(findMissingHeaders({ rules, required })).toEqual([]);
  });

  it('requires the enforcing Content Security Policy, which the report-only one does not replace', () => {
    const headersOf = name => `/*
  Strict-Transport-Security: max-age=31536000
  X-Frame-Options: DENY
  Permissions-Policy: camera=()
  ${name}: default-src 'self'

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
    const findMissing = name => findMissingHeaders({
      rules: parseHeadersRules(headersOf(name)),
      required: REQUIRED_HEADERS
    });

    expect(findMissing('Content-Security-Policy-Report-Only'))
      .toEqual([{ pattern: '/*', header: 'Content-Security-Policy' }]);
    expect(findMissing('Content-Security-Policy')).toEqual([]);
  });

  it('skips requirements without a pattern, even with rules that are null or have none', () => {
    const required = [{ headers: ['X-A'] }, { pattern: '', headers: ['X-A'] }, { pattern: 42, headers: ['X-A'] }];

    expect(findMissingHeaders({ rules: [null, {}, { headers: ['x-a'] }], required })).toEqual([]);
  });
});
