// Constants
import {
  GENERIC_REMOVE_PORT_LABEL,
  GENERIC_REMOVE_PORT_TOOLTIP,
  IMAGE_FIELD,
  NO_CONTROL_PORTS,
  SAMPLE_CONTROL_PORTS
} from './constants';

/**
 * Gives the control ports that the form shows: those of the plugin, none for an edited plugin
 * without any, and two samples for a new plugin.
 * @param {Object} params
 * @param {Array<Object>} [params.controlPorts] control ports of the plugin
 * @param {boolean} [params.edit=false] whether the form edits a plugin
 * @returns {Array<Object>} the control ports to show
 */
const readControlPorts = ({ controlPorts, edit = false } = {}) => {
  if (Array.isArray(controlPorts)) return controlPorts;

  return edit ? NO_CONTROL_PORTS : SAMPLE_CONTROL_PORTS;
};

// True for the fields of a form, false for a missing value or any other object
const isFormData = value => value instanceof FormData;

/**
 * Removes the image field of a form when no file was chosen, so that an edit keeps the image
 * of the plugin. A file input without a file sends an empty, nameless file.
 * @param {FormData} [formData] fields of the plugin form, changed in place
 * @returns {FormData} the same fields, or the value given when it is not a form
 */
const removeEmptyImage = (formData) => {
  if (!isFormData(formData)) return formData;

  const image = formData.get(IMAGE_FIELD);
  const hasChosenImage = Boolean(image && image.size);

  if (!hasChosenImage) formData.delete(IMAGE_FIELD);

  return formData;
};

/**
 * Gives the fields of a form as an object of their values, keyed by field name. A name given
 * several times keeps its last value.
 * @param {FormData} [formData] fields of a form
 * @returns {Object<string, string|File>} the value of each field, or no field without a form
 *
 * @example
 * formDataToObject(new FormData(controlPortForm)); // { name: 'Gain', default: '0.5', ... }
 */
const formDataToObject = (formData) => {
  if (!isFormData(formData)) return {};

  return Array.from(formData.entries()).reduce((fields, [name, value]) => ({
    ...fields,
    [name]: value
  }), {});
};

/**
 * Gives the accessible name of the button that removes a control port, after the name of the port.
 * @param {*} [name] name of the control port
 * @returns {string} "Remove" and the trimmed name, or a generic name when the name is not a text
 *   with a character other than a space
 *
 * @example
 * toRemovePortLabel('Gain'); // 'Remove Gain'
 * toRemovePortLabel(undefined); // 'Remove this control port'
 */
const toRemovePortLabel = (name) => {
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!trimmedName) return GENERIC_REMOVE_PORT_LABEL;

  return `Remove ${trimmedName}`;
};

/**
 * Gives the tooltip of the button that removes a control port, after the name of the port.
 * @param {*} [name] name of the control port
 * @returns {string} "Click to remove" and the trimmed name, or a generic tooltip when the name is
 *   not a text with a character other than a space
 *
 * @example
 * toRemovePortTooltip('Gain'); // 'Click to remove Gain'
 * toRemovePortTooltip(undefined); // 'Click to remove this control port'
 */
const toRemovePortTooltip = (name) => {
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!trimmedName) return GENERIC_REMOVE_PORT_TOOLTIP;

  return `Click to remove ${trimmedName}`;
};

export {
  formDataToObject,
  readControlPorts,
  removeEmptyImage,
  toRemovePortLabel,
  toRemovePortTooltip
};
