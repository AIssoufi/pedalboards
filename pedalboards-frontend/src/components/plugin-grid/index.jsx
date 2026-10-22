// Dependencies

// Components: imported from its own module, since the `components` barrel imports this grid
import Plugin from '../plugin';
import Loader from '../loader';

// Styles
import './style.scss';

// Plugins of a grid given none, so that it shows its empty state
const NO_PLUGINS = [];
// Cards of the first row on the widest layout, five cards of 240 pixels with their margins in the
// 1200 of the main container: their screenshots load at once, the others once they near the
// viewport
const FIRST_ROW_CARD_COUNT = 5;

/**
 * Props of {@link PluginGrid}.
 *
 * @typedef {Object} PluginGridProps
 * @property {boolean} [isLoading=false] - Shows the loader in place of the grid while truthy.
 * @property {Array<import('../plugin').PluginProps>} [plugins=[]] - Plugins to show, one card
 *   each.
 */

/**
 * Grid of the plugin cards, or a message when no plugin matches the search. Shows the loader in
 * its place while `isLoading` is truthy. The screenshots below the first row load only once they
 * near the viewport.
 *
 * @param {PluginGridProps} props - Props of the component.
 */
const PluginGrid = ({ plugins = NO_PLUGINS, isLoading = false }) => {
  if (isLoading) return <Loader />;

  // The plugins come from the API as it answers: anything but a list shows the empty state
  const pluginList = Array.isArray(plugins) ? plugins : NO_PLUGINS;

  return (
    <div className="plugin-container">
      {
        (pluginList.length > 0) ? pluginList.map(
          (p, index) => (
            <Plugin key={p._id} {...p} isScreenshotLazy={index >= FIRST_ROW_CARD_COUNT} />
          )
        )
          : <p lang="fr">Aucun plugin ne correspond à votre recherche !</p>
      }
    </div>
  );
};

export default PluginGrid;
