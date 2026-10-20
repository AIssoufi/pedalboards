// Tests of the plugin service, run with the test runner of Node.js. The service uses the ES
// module syntax, which babel-register transpiles as when the server starts (see index.js)
require('babel-register')({
  presets: ['env']
});

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { buildNameQuery, escapeRegExp, findPluginPage } = require('./plugin.service');

/**
 * Creates a stand-in for a MongoDB collection whose cursor applies find, sort, collation, skip
 * and limit to an array, recording the order of the calls.
 *
 * @param {Object[]} plugins - Documents of the collection.
 * @returns {{ collection: Object, calls: string[], queries: Object[], state: Object }} The
 * collection, the names of the cursor methods in the order they were called, the queries passed
 * to find, and the last sort, collation, skip and limit of the cursor.
 */
const createFakeCollection = (plugins) => {
  const calls = [];
  const queries = [];
  const state = {
    sort: null, collation: null, skip: 0, limit: Infinity
  };

  const cursor = {
    sort: (sort) => { calls.push('sort'); state.sort = sort; return cursor; },
    collation: (collation) => {
      calls.push('collation'); state.collation = collation; return cursor;
    },
    skip: (skip) => { calls.push('skip'); state.skip = skip; return cursor; },
    limit: (limit) => { calls.push('limit'); state.limit = limit; return cursor; },
    count: () => Promise.resolve(plugins.length),
    toArray: () => {
      const [field] = Object.keys(state.sort || {});
      const sorted = field
        ? [...plugins].sort((a, b) => a[field].localeCompare(b[field], 'en'))
        : plugins;

      return Promise.resolve(sorted.slice(state.skip, state.skip + state.limit));
    }
  };

  const collection = {
    find: (query) => { calls.push('find'); queries.push(query); return cursor; }
  };

  return { collection, calls, queries, state };
};

const UNSORTED_PLUGINS = [
  { name: 'MDA Overdrive' },
  { name: 'Gxdetune' },
  { name: 'Auto-wah' },
  { name: 'GxBooster' },
  { name: 'Nekobi' }
];

describe('findPluginPage', () => {
  it('sorts by name before cutting the page, so the order holds across the pages', async () => {
    const { collection } = createFakeCollection(UNSORTED_PLUGINS);

    const firstPage = await findPluginPage({ collection, page: 1, pagesize: 2 });
    const secondPage = await findPluginPage({ collection, page: 2, pagesize: 2 });
    const lastPage = await findPluginPage({ collection, page: 3, pagesize: 2 });

    assert.deepEqual(
      [...firstPage.data, ...secondPage.data, ...lastPage.data].map(({ name }) => name),
      ['Auto-wah', 'GxBooster', 'Gxdetune', 'MDA Overdrive', 'Nekobi']
    );
  });

  it('sorts in the database, ignoring the case, before the skip and the limit', async () => {
    const { collection, calls, state } = createFakeCollection(UNSORTED_PLUGINS);

    await findPluginPage({ collection, page: 2, pagesize: 2 });

    assert.deepEqual(calls, ['find', 'sort', 'collation', 'skip', 'limit']);
    assert.deepEqual(state.sort, { name: 1 });
    assert.deepEqual(state.collation, { locale: 'en' });
  });

  it('returns the number of plugins matching the filter, not the size of the page', async () => {
    const { collection } = createFakeCollection(UNSORTED_PLUGINS);

    const { count, data } = await findPluginPage({ collection, page: 1, pagesize: 2 });

    assert.equal(count, UNSORTED_PLUGINS.length);
    assert.equal(data.length, 2);
  });

  it('returns an empty page past the last one', async () => {
    const { collection } = createFakeCollection(UNSORTED_PLUGINS);

    const { data } = await findPluginPage({ collection, page: 4, pagesize: 2 });

    assert.deepEqual(data, []);
  });

  it('finds every plugin without a filter', async () => {
    const { collection, queries } = createFakeCollection(UNSORTED_PLUGINS);

    await findPluginPage({ collection, page: 1, pagesize: 2, filter: null });

    assert.deepEqual(queries, [{}]);
  });

  it('matches any filtered field, ignoring the case', async () => {
    const { collection, queries } = createFakeCollection(UNSORTED_PLUGINS);

    await findPluginPage({
      collection, page: 1, pagesize: 2, filter: { brand: 'MDA', label: 'Gx' }
    });

    assert.deepEqual(queries, [{
      $or: [
        { brand: { $regex: '.*MDA.*', $options: 'i' } },
        { label: { $regex: '.*Gx.*', $options: 'i' } }
      ]
    }]);
  });
});

/**
 * Builds the regular expression that MongoDB runs for a query of findPluginPage.
 *
 * @param {{ $regex: string, $options: string }} condition - Condition of one filtered field.
 * @returns {RegExp} The regular expression of the condition.
 */
const toRegExp = ({ $regex, $options }) => new RegExp($regex, $options);

describe('findPluginPage with special characters', () => {
  [
    ['C++', 'C++ Synth', 'CC Synth'],
    ['(', 'Delay (stereo)', 'Delay stereo'],
    ['a.b', 'a.b Fuzz', 'axb Fuzz']
  ].forEach(([searched, matching, other]) => {
    it(`matches "${searched}" literally`, async () => {
      const { collection, queries } = createFakeCollection(UNSORTED_PLUGINS);

      await findPluginPage({ collection, page: 1, pagesize: 2, filter: { label: searched } });

      const regExp = toRegExp(queries[0].$or[0].label);
      assert.equal(regExp.test(matching), true);
      assert.equal(regExp.test(other), false);
    });
  });
});

describe('escapeRegExp', () => {
  it('puts a backslash before each special character', () => {
    assert.equal(escapeRegExp('.*+?^${}()|[]\\'), '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('keeps a text without special characters', () => {
    assert.equal(escapeRegExp('MDA Overdrive'), 'MDA Overdrive');
  });

  [
    ['an empty text', '', ''],
    ['a number', 42, '42'],
    ['undefined', undefined, ''],
    ['null', null, '']
  ].forEach(([description, value, expected]) => {
    it(`turns ${description} into text`, () => {
      assert.equal(escapeRegExp(value), expected);
    });
  });
});

describe('buildNameQuery', () => {
  [
    ['C++', 'C++ Synth', 'CC Synth'],
    ['(', 'Delay (stereo)', 'Delay stereo'],
    ['a.b', 'a.b Fuzz', 'axb Fuzz']
  ].forEach(([searched, matching, other]) => {
    it(`matches "${searched}" literally in the name`, () => {
      const regExp = toRegExp(buildNameQuery(searched).name);

      assert.equal(regExp.test(matching), true);
      assert.equal(regExp.test(other), false);
    });
  });

  it('ignores the case', () => {
    assert.deepEqual(buildNameQuery('Gx'), { name: { $regex: '.*Gx.*', $options: 'i' } });
  });

  [
    ['an empty text', ''],
    ['undefined', undefined],
    ['null', null]
  ].forEach(([description, name]) => {
    it(`matches every plugin for ${description}`, () => {
      assert.deepEqual(buildNameQuery(name), {});
    });
  });
});
