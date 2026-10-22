// Constants
import { NO_CONTROL_PORTS, SAMPLE_CONTROL_PORTS } from './constants';

// Utils
import { readControlPorts, removeEmptyImage } from './utils';

const PORTS = [{
  name: 'Threshold', default: 0.5, max: 1, min: 0
}];

describe('readControlPorts', () => {
  it('gives the control ports of the plugin', () => {
    expect(readControlPorts({ controlPorts: PORTS, edit: true })).toBe(PORTS);
  });

  it('keeps an empty list of control ports', () => {
    expect(readControlPorts({ controlPorts: [] })).toEqual([]);
  });

  it('gives no control ports to an edited plugin without any', () => {
    expect(readControlPorts({ edit: true })).toBe(NO_CONTROL_PORTS);
    expect(readControlPorts({ controlPorts: null, edit: true })).toBe(NO_CONTROL_PORTS);
  });

  it('gives the samples to a new plugin', () => {
    expect(readControlPorts({})).toBe(SAMPLE_CONTROL_PORTS);
    expect(readControlPorts()).toBe(SAMPLE_CONTROL_PORTS);
  });

  it('ignores control ports that are not a list', () => {
    expect(readControlPorts({ controlPorts: '[]', edit: true })).toBe(NO_CONTROL_PORTS);
  });
});

describe('removeEmptyImage', () => {
  it('keeps a chosen image', () => {
    const formData = new FormData();
    const image = new File(['png'], 'gate.png', { type: 'image/png' });

    formData.append('image', image);

    expect(removeEmptyImage(formData).get('image')).toBeTruthy();
  });

  it('removes the empty file of an input without a file', () => {
    const formData = new FormData();

    formData.append('image', new File([], ''));

    expect(removeEmptyImage(formData).has('image')).toBe(false);
  });

  it('removes an image field that is not a file', () => {
    const formData = new FormData();

    formData.append('image', '');

    expect(removeEmptyImage(formData).has('image')).toBe(false);
  });

  it('leaves a form without an image field as it is', () => {
    const formData = new FormData();

    formData.append('name', 'Gate');

    expect(removeEmptyImage(formData).has('image')).toBe(false);
    expect(formData.get('name')).toBe('Gate');
  });
});
