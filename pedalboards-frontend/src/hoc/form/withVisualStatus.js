// Dependencies
import {
  compose, defaultProps, setPropTypes, withHandlers, withStateHandlers
} from 'recompose';
import PropTypes from 'prop-types';

export default compose(
  withStateHandlers(
    {
      hasChanged: false
    },
    {
      setValue: () => value => (
        (value !== undefined && value !== null) ? ({
          hasChanged: true,
          value
        }) : ({ hasChanged: true }))
    }
  ),
  withHandlers({
    onChange: props => (event) => {
      const { onChange = f => f, setValue } = props;
      const { target: { value } = {} } = event;

      setValue(value);
      onChange(event);
    }
  }),
  defaultProps({
    hasChanged: false
  }),
  setPropTypes({
    hasChanged: PropTypes.bool
  })
);
