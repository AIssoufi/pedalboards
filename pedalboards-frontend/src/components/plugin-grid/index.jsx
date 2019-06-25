// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  Plugin, Loader
} from 'components';

// Styles
import './style.scss';

const PluginGrid = ({ isLoading, plugins }) => {
  if (isLoading) return <Loader />;

  return (
    <div className="plugin-container">
      {
        (plugins.length > 0) ? plugins.map(
          p => <Plugin key={p._id} {...p} />
        )
          : <p>Aucun plugin ne correspond à votre recherche !</p>
      }
    </div>
  );
};

PluginGrid.propTypes = {
  plugins: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    brand: PropTypes.string
  })).isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default PluginGrid;
