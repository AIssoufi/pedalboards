// Dependencies
import PropTypes from 'prop-types';

// Components: imported from its own module, since the `components` barrel imports
// `plugin-grid`, which imports this HOC back
import Loader from '../components/loader';

/**
 * Shows the loader in place of a component while its `isLoading` prop is truthy, then the
 * component with all its props, `isLoading` included.
 *
 * @param {React.ComponentType} BaseComponent - Component shown once the data is loaded.
 * @returns {React.ComponentType} The component that shows the loader first.
 */
const withLoader = (BaseComponent) => {
  /** Renders the loader while `isLoading` is truthy, then `BaseComponent` with all its props. */
  const WithLoader = props => (
    props.isLoading ? <Loader /> : <BaseComponent {...props} />
  );
  const baseName = BaseComponent.displayName || BaseComponent.name || 'Component';
  WithLoader.displayName = `withLoader(${baseName})`;
  WithLoader.propTypes = {
    /** Shows the loader while truthy. The other props go to `BaseComponent` as they are. */
    isLoading: PropTypes.bool
  };

  return WithLoader;
};

export default withLoader;
