// Constants
import { BRAND_RGB, PNG_SIGNATURE, RGB_CHANNELS, UINT32_BYTES } from './constants.mjs';

// Utils
import { encodePng, isImageSide } from './png.mjs';
import { decodePng, readChunks } from './png-test-utils.mjs';

describe('isImageSide', () => {
  it.each([1, 192, 512])('accepts %s', side => {
    expect(isImageSide(side)).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN, Infinity, '1', undefined, null])('refuses %s', side => {
    expect(isImageSide(side)).toBe(false);
  });
});

describe('encodePng', () => {
  const image = {
    width: 2,
    height: 3,
    pixels: new Uint8Array(Array.from({ length: 18 }, (_value, index) => index * 10))
  };

  it('writes the signature, then a header, the pixels and the end', () => {
    const png = encodePng(image);

    expect([...png.subarray(0, PNG_SIGNATURE.length)]).toEqual(PNG_SIGNATURE);
    expect(readChunks(png).map(chunk => chunk.type)).toEqual(['IHDR', 'IDAT', 'IEND']);
  });

  it('declares an opaque 8-bit RGB image with no interlacing', () => {
    const header = readChunks(encodePng(image))[0].data;

    expect(header.readUInt32BE(0)).toBe(2);
    expect(header.readUInt32BE(UINT32_BYTES)).toBe(3);
    expect([...header.subarray(2 * UINT32_BYTES)]).toEqual([8, 2, 0, 0, 0]);
  });

  it('closes each chunk with the checksum of its type and data', () => {
    readChunks(encodePng(image)).forEach(chunk => {
      expect(chunk.checksum).toBe(chunk.expectedChecksum);
    });
  });

  it('stores each row unfiltered, the pixels unchanged', () => {
    const decoded = decodePng(encodePng(image));

    expect(decoded.filters).toEqual([0, 0, 0]);
    expect([...decoded.pixels]).toEqual([...image.pixels]);
  });

  it('encodes a single pixel', () => {
    const pixels = new Uint8Array(BRAND_RGB);

    expect([...decodePng(encodePng({ width: 1, height: 1, pixels })).pixels]).toEqual(BRAND_RGB);
  });

  it.each([
    ['a zero', 0],
    ['a negative', -1],
    ['a fractional', 1.5],
    ['a NaN', Number.NaN],
    ['a text', '1'],
    ['a missing', undefined]
  ])('refuses %s side', (_case, side) => {
    const pixels = new Uint8Array(RGB_CHANNELS);

    expect(() => encodePng({ width: side, height: 1, pixels })).toThrow(RangeError);
    expect(() => encodePng({ width: 1, height: side, pixels })).toThrow(RangeError);
  });

  it.each([
    ['too few', new Uint8Array(17)],
    ['too many', new Uint8Array(19)],
    ['no', undefined],
    ['null', null]
  ])('refuses %s channel values', (_case, pixels) => {
    expect(() => encodePng({ width: 2, height: 3, pixels })).toThrow(RangeError);
  });

  it('refuses no image', () => {
    expect(() => encodePng()).toThrow(RangeError);
  });
});
