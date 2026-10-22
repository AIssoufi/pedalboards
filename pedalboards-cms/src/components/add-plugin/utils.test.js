// Constants
import {
  GENERIC_REMOVE_PORT_LABEL, GENERIC_REMOVE_PORT_TOOLTIP, NO_CONTROL_PORTS, SAMPLE_CONTROL_PORTS
} from './constants';

// Utils
import {
  formDataToObject, readControlPorts, removeEmptyImage, toRemovePortLabel, toRemovePortTooltip
} from './utils';

const PORTS = [{
  name: 'Threshold', default: 0.5, max: 1, min: 0
}];

describe('formDataToObject', () => {
  it('gives the value of each field by its name', () => {
    const formData = new FormData();
    formData.append('name', 'Gain');
    formData.append('default', '0.5');

    expect(formDataToObject(formData)).toEqual({ name: 'Gain', default: '0.5' });
  });

  it('keeps the last value of a name given several times', () => {
    const formData = new FormData();
    formData.append('name', 'Gain');
    formData.append('name', 'Volume');

    expect(formDataToObject(formData)).toEqual({ name: 'Volume' });
  });

  it('keeps an empty value', () => {
    const formData = new FormData();
    formData.append('name', '');

    expect(formDataToObject(formData)).toEqual({ name: '' });
  });

  it('gives no field for a form without fields', () => {
    expect(formDataToObject(new FormData())).toEqual({});
  });

  it.each([
    ['a missing form', undefined],
    ['null', null],
    ['an object that is not a form', { name: 'Gain' }]
  ])('gives no field for %s', (label, formData) => {
    expect(formDataToObject(formData)).toEqual({});
  });
});

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

  it.each([
    ['a missing form', undefined],
    ['null', null],
    ['an object that is not a form', { image: '' }]
  ])('gives back %s as it is', (label, formData) => {
    expect(removeEmptyImage(formData)).toBe(formData);
  });
});

describe('toRemovePortLabel', () => {
  it('names the control port to remove', () => {
    expect(toRemovePortLabel('Threshold')).toBe('Remove Threshold');
  });

  it('trims the spaces around the name', () => {
    expect(toRemovePortLabel('  Threshold ')).toBe('Remove Threshold');
  });

  it.each([
    ['an empty name', ''],
    ['a name of spaces', '   '],
    ['a missing name', undefined],
    ['null', null],
    ['a number', 42]
  ])('gives a generic label for %s', (label, name) => {
    expect(toRemovePortLabel(name)).toBe(GENERIC_REMOVE_PORT_LABEL);
  });
});

describe('toRemovePortTooltip', () => {
  it('names the control port to remove', () => {
    expect(toRemovePortTooltip('Threshold')).toBe('Click to remove Threshold');
  });

  it('trims the spaces around the name', () => {
    expect(toRemovePortTooltip('  Threshold ')).toBe('Click to remove Threshold');
  });

  it.each([
    ['an empty name', ''],
    ['a name of spaces', '   '],
    ['a missing name', undefined],
    ['null', null],
    ['a number', 42]
  ])('gives a generic tooltip for %s', (label, name) => {
    expect(toRemovePortTooltip(name)).toBe(GENERIC_REMOVE_PORT_TOOLTIP);
  });
});
