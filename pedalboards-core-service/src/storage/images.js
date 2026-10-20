// Images of the plugins, in the R2 bucket of the local entry (src/local.js), which wrangler
// simulates on disk. The deployed Worker has no bucket and never imports this file.
import { PLUGIN_IMAGE_KEY_PREFIX, PLUGIN_IMAGE_ROUTE } from '../constants.js';

/**
 * Gives the key of the image of a plugin in the bucket: one image per plugin.
 *
 * @param {string} id - Id of the plugin.
 * @returns {string} The key, such as `plugins/mda-overdrive`.
 */
export const toImageKey = id => `${PLUGIN_IMAGE_KEY_PREFIX}${id}`;

/**
 * Gives the address that serves the image of a plugin. Its version changes with each upload, so a
 * browser never shows a former image from its cache.
 *
 * @param {Object} params
 * @param {string} params.origin - Origin of the API, such as `http://localhost:8080`.
 * @param {string} params.id - Id of the plugin.
 * @param {number} params.version - Version of the image, such as the time of its upload.
 * @returns {string} The address, such as `http://localhost:8080/api/images/mda-overdrive?v=1`.
 */
export const toImageUrl = ({ origin, id, version }) => `${origin}/api${PLUGIN_IMAGE_ROUTE}/${encodeURIComponent(id)}?v=${version}`;

/**
 * Saves the image of a plugin, in place of its former one.
 *
 * @param {Object} params
 * @param {R2Bucket} params.images - Bucket of the images.
 * @param {string} params.id - Id of the plugin.
 * @param {File} params.image - Uploaded image, whose type the bucket keeps to serve it.
 * @returns {Promise<void>}
 */
export const savePluginImage = async ({ images, id, image }) => {
	await images.put(toImageKey(id), await image.arrayBuffer(), { httpMetadata: { contentType: image.type } });
};

/**
 * Reads the image of a plugin.
 *
 * @param {Object} params
 * @param {R2Bucket} params.images - Bucket of the images.
 * @param {string} params.id - Id of the plugin.
 * @returns {Promise<R2ObjectBody | null>} The image, or null when the plugin has none.
 */
export const findPluginImage = ({ images, id }) => images.get(toImageKey(id));

/**
 * Deletes the image of a plugin, if it has one.
 *
 * @param {Object} params
 * @param {R2Bucket} params.images - Bucket of the images.
 * @param {string} params.id - Id of the plugin.
 * @returns {Promise<void>}
 */
export const deletePluginImage = ({ images, id }) => images.delete(toImageKey(id));
