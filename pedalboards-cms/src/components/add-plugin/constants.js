/** Control ports that a new plugin starts with, as examples to edit or remove */
const SAMPLE_CONTROL_PORTS = [{
  name: 'Blend 1',
  default: 0.25,
  max: 0.00,
  min: 1.00
}, {
  name: 'Blend 2',
  default: 0.25,
  max: 0.00,
  min: 1.00
}];

/** Control ports of an edited plugin that has none */
const NO_CONTROL_PORTS = [];

/** Name of the file field of the form */
const IMAGE_FIELD = 'image';

export {
  IMAGE_FIELD,
  NO_CONTROL_PORTS,
  SAMPLE_CONTROL_PORTS
};
