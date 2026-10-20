// Tests of the plugin service, run with the test runner of Node.js. The service uses the ES
// module syntax, which babel-register transpiles as when the server starts (see index.js)
require('babel-register')({
  presets: ['env']
});

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { findPluginPage } = require('./plugin.service');

/**
 * Creates a stand-in for a MongoDB collection whose cursor applies find, sort, collation, skip
 * and limit to an array, recording the order of the calls.
 *
 * @param {Object[]} plugins - Documents of the collection.
 * @returns {{ collection: Object, calls: string[], queries: Object[] }} The collection, the
 * names of the cursor methods in the order they were called, and the queries passed to find.
 */
const createFakeCollection = (plugins) => {
  const calls = [];
  const queries = [];
  const state = { sort: null, skip: 0, limit: Infinity };

  const cursor = {
    sort: (sort) => { calls.push('sort'); state.sort = sort; return cursor; },
    collation: () => { calls.push('collation'); return cursor; },
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

  return { collection, calls, queries };
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

  it('asks the database to sort on name, ignoring the case, before the skip and the limit', async () => {
    const { collection, calls } = createFakeCollection(UNSORTED_PLUGINS);

    await findPluginPage({ collection, page: 2, pagesize: 2 });

    assert.deepEqual(calls, ['find', 'sort', 'collation', 'skip', 'limit']);
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
