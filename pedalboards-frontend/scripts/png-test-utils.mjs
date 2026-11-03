// Test helpers that read back the PNG files that png.mjs writes

// Dependencies
import { crc32, inflateSync } from 'node:zlib';

// Constants
import { CHUNK_TYPE_BYTES, PNG_SIGNATURE, RGB_CHANNELS, UINT32_BYTES } from './constants.mjs';

/** Bytes around the data of a chunk: its length, its type and its checksum */
const CHUNK_FRAME_BYTES = UINT32_BYTES + CHUNK_TYPE_BYTES + UINT32_BYTES;

/**
 * Splits a PNG file into its chunks.
 *
 * @param {Buffer} png - The bytes of the file.
 * @returns {{ type: string, data: Buffer, checksum: number, expectedChecksum: number }[]} Each
 * chunk, with the checksum it holds and the one of its type and data.
 */
export const readChunks = png => {
  const chunks = [];
  let offset = PNG_SIGNATURE.length;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const typeStart = offset + UINT32_BYTES;
    const dataEnd = typeStart + CHUNK_TYPE_BYTES + length;
    const typeAndData = png.subarray(typeStart, dataEnd);
    chunks.push({
      type: typeAndData.toString('latin1', 0, CHUNK_TYPE_BYTES),
      data: typeAndData.subarray(CHUNK_TYPE_BYTES),
      checksum: png.readUInt32BE(dataEnd),
      expectedChecksum: crc32(typeAndData)
    });
    offset += CHUNK_FRAME_BYTES + length;
  }

  return chunks;
};

/**
 * Reads back what encodePng writes: 8-bit RGB rows, each behind one filter byte.
 *
 * @param {Buffer} png - The bytes of the file.
 * @returns {{ width: number, height: number, filters: number[], pixels: Buffer }} The sides, the
 * filter byte of each row and the red, green and blue of each pixel.
 */
export const decodePng = png => {
  const chunks = readChunks(png);
  const header = chunks.find(chunk => chunk.type === 'IHDR').data;
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(UINT32_BYTES);
  const data = inflateSync(Buffer.concat(
    chunks.filter(chunk => chunk.type === 'IDAT').map(chunk => chunk.data)
  ));
  const rowLength = 1 + width * RGB_CHANNELS;
  const rows = Array.from({ length: height }, (_row, index) => (
    data.subarray(index * rowLength, (index + 1) * rowLength)
  ));

  return {
    width,
    height,
    filters: rows.map(row => row[0]),
    pixels: Buffer.concat(rows.map(row => row.subarray(1)))
  };
};
