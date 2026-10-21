// Dependencies
import PropTypes from 'prop-types';

// Components
import { Plugin } from '..';

// HOC
import { withLoader } from '../../hoc';

// Styles
import './style.scss';

const PluginGrid = ({ plugins }) => (
  <div className="plugin-container">
    {
      (plugins.length > 0) ? plugins.map(
        p => <Plugin key={p._id} {...p} />
      )
        : <p>Aucun plugin ne correspond à votre recherche !</p>
    }
  </div>
);

PluginGrid.propTypes = {
  plugins: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    brand: PropTypes.string
  })).isRequired
};

export default withLoader(PluginGrid);
