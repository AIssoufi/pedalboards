/**
 * Turns a plugin name into the id of its page: lower case ASCII words joined by dashes.
 *
 * @param {string} name - Name of the plugin, such as `MDA Overdrive`.
 * @returns {string} The id, such as `mda-overdrive`, or an empty string when the name has no letter nor digit.
 */
export const toPluginId = name => name
	.normalize('NFKD')
	.replace(/\p{M}/gu, '')
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/^-+|-+$/g, '');
