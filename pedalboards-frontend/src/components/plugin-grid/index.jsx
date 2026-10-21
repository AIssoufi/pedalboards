// Dependencies
import PropTypes from 'prop-types';

// Components: imported from its own module, since the `components` barrel imports this grid
import Plugin from '../plugin';
import Loader from '../loader';

// Styles
import './style.scss';

// Plugins of a grid given none, so that it shows its empty state
const NO_PLUGINS = [];

/**
 * Grid of the plugin cards, or a message when no plugin matches the search. Shows the loader in
 * its place while `isLoading` is truthy.
 */
const PluginGrid = ({ plugins = NO_PLUGINS, isLoading = false }) => {
  if (isLoading) return <Loader />;

  // The plugins come from the API as it answers: anything but a list shows the empty state
  const pluginList = Array.isArray(plugins) ? plugins : NO_PLUGINS;

  return (
    <div className="plugin-container">
      {
        (pluginList.length > 0) ? pluginList.map(
          p => <Plugin key={p._id} {...p} />
        )
          : <p>Aucun plugin ne correspond à votre recherche !</p>
      }
    </div>
  );
};

PluginGrid.propTypes = {
  /** Shows the loader in place of the grid while truthy. @default false */
  isLoading: PropTypes.bool,
  /** Plugins to show, one card each. @default [] */
  plugins: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    brand: PropTypes.string
  }))
};

export default PluginGrid;
