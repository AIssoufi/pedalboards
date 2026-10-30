import { toImageDimension } from './index';

describe('toImageDimension', () => {
  it.each([1, 261, 430])('keeps %p', (value) => {
    expect(toImageDimension(value)).toBe(value);
  });

  it.each([
    undefined, null, 0, -1, 261.5, NaN, Infinity, '430', '', true, {}, []
  ])('leaves out %p', (value) => {
    expect(toImageDimension(value)).toBeUndefined();
  });
});
