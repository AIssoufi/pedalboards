/** Control ports that a new plugin starts with, as examples to edit or remove */
const SAMPLE_CONTROL_PORTS = [{
  name: 'Blend 1',
  default: 0.25,
  max: 1.00,
  min: 0.00
}, {
  name: 'Blend 2',
  default: 0.25,
  max: 1.00,
  min: 0.00
}];

/** Control ports of an edited plugin that has none */
const NO_CONTROL_PORTS = [];

/** Name of the file field of the form */
const IMAGE_FIELD = 'image';

/** Title of the form that adds a plugin */
const ADD_TITLE = 'Add a plugin';

/** Title of the form that edits a plugin */
const EDIT_TITLE = 'Edit the plugin';

/** Name of the button that removes a control port without a name */
const GENERIC_REMOVE_PORT_LABEL = 'Remove this control port';

/** Tooltip of the button that removes a control port without a name */
const GENERIC_REMOVE_PORT_TOOLTIP = 'Click to remove this control port';

export {
  ADD_TITLE,
  EDIT_TITLE,
  GENERIC_REMOVE_PORT_LABEL,
  GENERIC_REMOVE_PORT_TOOLTIP,
  IMAGE_FIELD,
  NO_CONTROL_PORTS,
  SAMPLE_CONTROL_PORTS
};
