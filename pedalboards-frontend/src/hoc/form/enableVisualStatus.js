// Dependencies
import { branch, compose, setPropTypes } from 'recompose';
import PropTypes from 'prop-types';

// HOC
import { withVisualStatus } from 'hoc/form';

export default BaseComponent => compose(
  branch(
    ({ enableVisualStatus }) => enableVisualStatus,
    withVisualStatus
  ),
  setPropTypes({
    enableVisualStatus: PropTypes.bool.isRequired
  })
)(BaseComponent);
