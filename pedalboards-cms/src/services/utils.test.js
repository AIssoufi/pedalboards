// Utils
import { isUsablePluginId } from './utils';

describe('isUsablePluginId', () => {
  it('accepts a non-empty text, even one holding dots or reserved characters', () => {
    const ids = ['gate', 'a', '...', '.gate', 'gate..', 'gate/v2?mode=fast#top'];

    expect(ids.map(isUsablePluginId)).toEqual(ids.map(() => true));
  });

  it('rejects the dot segments, which the URL parser would remove from the address', () => {
    expect(['.', '..'].map(isUsablePluginId)).toEqual([false, false]);
  });

  it('rejects an empty or missing id and any value that is not a text', () => {
    const values = ['', undefined, null, 42, NaN, ['gate'], { id: 'gate' }];

    expect(values.map(isUsablePluginId)).toEqual(values.map(() => false));
  });
});
