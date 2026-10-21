import { findMarkers } from './utils.mjs';

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
