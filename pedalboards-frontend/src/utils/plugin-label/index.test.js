import { isPluginLabelShown } from './index';

describe('isPluginLabelShown', () => {
  it.each(['abGate', ' CS Chorus 1 ', 'a'])('shows the label %p', (label) => {
    expect(isPluginLabelShown(label)).toBe(true);
  });

  it.each([undefined, null, '', '   ', '\n\t', 42, {}, ['abGate']])(
    'hides the label %p, which names nothing',
    (label) => {
      expect(isPluginLabelShown(label)).toBe(false);
    }
  );
});
