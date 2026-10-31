// Utils
import { buildPageTitle } from './index';

describe('buildPageTitle', () => {
  it.each([
    ['Plugins', 'Plugins - Pedalboards'],
    ['abGate', 'abGate - Pedalboards'],
    ['  CS Chorus 1 ', 'CS Chorus 1 - Pedalboards'],
    ['Pedalboards', 'Pedalboards - Pedalboards']
  ])('titles the page %p', (pageName, expected) => {
    expect(buildPageTitle(pageName)).toBe(expected);
  });

  it.each([undefined, null, '', '   ', '\n\t', 42, {}, ['abGate']])(
    'falls back on the name of the site for %p, which names no page',
    (pageName) => {
      expect(buildPageTitle(pageName)).toBe('Pedalboards');
    }
  );
});
