// Pure helpers that encode an opaque image as a PNG file with the zlib of Node.js, so the install
// icons need no image package

// Dependencies
import { crc32, deflateSync } from 'node:zlib';

// Constants
import {
  ADAPTIVE_FILTERING,
  BIT_DEPTH,
  COMPRESSION_LEVEL,
  DEFLATE_COMPRESSION,
  NO_FILTER,
  NO_INTERLACE,
  PNG_SIGNATURE,
  RGB_CHANNELS,
  RGB_COLOR_TYPE,
  UINT32_BYTES
} from './constants.mjs';

/**
 * @typedef {object} RgbImage
 * @property {number} width - Width in pixels, a positive integer.
 * @property {number} height - Height in pixels, a positive integer.
 * @property {Uint8Array} pixels - Red, green and blue of each pixel, row after row from the top.
 */

/**
 * Tells whether a value can be the width or the height of an image.
 *
 * @param {*} value - Value to check.
 * @returns {boolean} True for a positive integer.
 * @example
 * isImageSide(192); // true
 * isImageSide(1.5); // false
 */
export const isImageSide = value => Number.isInteger(value) && value > 0;

/**
 * Writes a number on four bytes, the most significant first, as PNG stores its numbers.
 *
 * @param {number} value - Integer from 0 to 2 ** 32 - 1.
 * @returns {Buffer} The four bytes.
 */
const toUint32 = value => {
  const bytes = Buffer.alloc(UINT32_BYTES);
  bytes.writeUInt32BE(value);

  return bytes;
};

/**
 * Writes one PNG chunk: its length, its type, its data and the checksum of the type and the data.
 *
 * @param {{ type: string, data: Buffer }} params - The four-letter type and the data of the chunk.
 * @returns {Buffer} The bytes of the chunk.
 */
const buildChunk = ({ type, data }) => {
  const typeAndData = Buffer.concat([Buffer.from(type, 'latin1'), data]);

  return Buffer.concat([toUint32(data.length), typeAndData, toUint32(crc32(typeAndData))]);
};

/**
 * Encodes an opaque image as a PNG file, with no filter and the highest zlib compression.
 *
 * @param {RgbImage} image - The image to encode.
 * @returns {Buffer} The bytes of the PNG file.
 * @throws {RangeError} When a side is not a positive integer, or the pixels do not fill the image.
 * @example
 * encodePng({ width: 1, height: 1, pixels: new Uint8Array([136, 57, 150]) });
 */
export const encodePng = ({ width, height, pixels } = {}) => {
  const hasImageSides = isImageSide(width) && isImageSide(height);
  if (!hasImageSides) {
    throw new RangeError(`An image needs positive integer sides, not ${width} × ${height}`);
  }

  const rowLength = width * RGB_CHANNELS;
  const hasOnePixelPerPlace = pixels?.length === rowLength * height;
  if (!hasOnePixelPerPlace) {
    throw new RangeError(`A ${width} × ${height} image needs ${rowLength * height} channel values`);
  }

  const header = Buffer.concat([
    toUint32(width),
    toUint32(height),
    Buffer.from([BIT_DEPTH, RGB_COLOR_TYPE, DEFLATE_COMPRESSION, ADAPTIVE_FILTERING, NO_INTERLACE])
  ]);

  const rows = Array.from({ length: height }, (_row, index) => Buffer.concat([
    Buffer.from([NO_FILTER]),
    Buffer.from(pixels.subarray(index * rowLength, (index + 1) * rowLength))
  ]));

  return Buffer.concat([
    Buffer.from(PNG_SIGNATURE),
    buildChunk({ type: 'IHDR', data: header }),
    buildChunk({
      type: 'IDAT',
      data: deflateSync(Buffer.concat(rows), { level: COMPRESSION_LEVEL })
    }),
    buildChunk({ type: 'IEND', data: Buffer.alloc(0) })
  ]);
};
