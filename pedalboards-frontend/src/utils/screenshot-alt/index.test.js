import { toScreenshotAlt } from './index';

describe('toScreenshotAlt', () => {
  it('names the plugin by its label', () => {
    expect(toScreenshotAlt('Spice')).toBe('Screenshot of Spice');
  });

  it('drops the spaces around the label', () => {
    expect(toScreenshotAlt('  CS Chorus 1 ')).toBe('Screenshot of CS Chorus 1');
  });

  it.each([undefined, null, '', '   ', 42, {}, ['Spice']])(
    'falls back to a generic text for %p',
    (label) => {
      expect(toScreenshotAlt(label)).toBe('Plugin screenshot');
    }
  );
});
