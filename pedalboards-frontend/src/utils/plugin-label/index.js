/**
 * Tells whether the label of a plugin can title its page: a label made only of spaces would give
 * a heading that names nothing.
 *
 * @param {*} label - Label of the plugin.
 * @returns {boolean} Whether the label is a text with a character other than a space.
 * @example
 * isPluginLabelShown('abGate'); // true
 * isPluginLabelShown('   '); // false
 */
const isPluginLabelShown = label => typeof label === 'string' && label.trim() !== '';

export { isPluginLabelShown };
