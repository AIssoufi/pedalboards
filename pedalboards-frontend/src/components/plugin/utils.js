/**
 * Gives the `width` or `height` attribute of an image from a size that the API gives in pixels,
 * so that the browser reserves its space before it loads.
 *
 * @param {*} value - Width or height of the image, from the API.
 * @returns {number|undefined} The size for a whole number of pixels above 0, or undefined for any
 *   other value, so that React leaves the attribute out.
 * @example
 * toImageDimension(430); // 430
 * toImageDimension('430'); // undefined
 */
const toImageDimension = value => (Number.isInteger(value) && value > 0 ? value : undefined);

export { toImageDimension };
