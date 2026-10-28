// Dependencies
import { createMemoryRouter } from 'react-router';

// Constants
import { PLUGIN_DETAILS_ROUTE, PLUGINS_PATHNAME } from '../../constants/routes';

// Utils
import { buildPluginPathname } from '.';

describe('buildPluginPathname', () => {
  it('ends the path of the details with the id', () => {
    expect(buildPluginPathname('auto-wah')).toBe('/plugin/auto-wah');
  });

  it.each([
    ['a slash', 'a/b', '/plugin/a%2Fb'],
    ['a space', 'a b', '/plugin/a%20b'],
    ['a question mark and a hash', 'a?b#c', '/plugin/a%3Fb%23c'],
    ['a percent sign', '100%', '/plugin/100%25'],
    ['an accent', 'été', '/plugin/%C3%A9t%C3%A9']
  ])('encodes an id holding %s', (_case, id, pathname) => {
    expect(buildPluginPathname(id)).toBe(pathname);
  });

  it('keeps the spaces around an id, which belong to it', () => {
    expect(buildPluginPathname(' a ')).toBe('/plugin/%20a%20');
  });

  it.each([
    ['an id that needs encoding', 'a/b?c#d 100%'],
    ['an id with an accent', 'été'],
    ['a plain id', 'auto-wah']
  ])('gives back %s as the id parameter of the details route', (_case, id) => {
    const router = createMemoryRouter(
      [{ path: PLUGIN_DETAILS_ROUTE, element: null }],
      { initialEntries: [buildPluginPathname(id)] }
    );

    expect(router.state.matches[0]?.params.id).toBe(id);
  });

  it.each([
    ['an empty id', ''],
    ['a blank id', '   '],
    ['a missing id', undefined],
    ['a null id', null],
    ['a number', 42],
    ['an object', { id: 'a' }]
  ])('leads to the list for %s', (_case, id) => {
    expect(buildPluginPathname(id)).toBe(PLUGINS_PATHNAME);
  });

  it('leads to the list when called without an argument', () => {
    expect(buildPluginPathname()).toBe(PLUGINS_PATHNAME);
  });
});
