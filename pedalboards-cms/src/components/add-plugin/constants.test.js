// Constants
import { SAMPLE_CONTROL_PORTS } from './constants';

describe('SAMPLE_CONTROL_PORTS', () => {
  it('gives each sample port a default between its min and its max', () => {
    SAMPLE_CONTROL_PORTS.forEach((port) => {
      expect(port.min).toBeLessThanOrEqual(port.default);
      expect(port.default).toBeLessThanOrEqual(port.max);
    });
  });
});
