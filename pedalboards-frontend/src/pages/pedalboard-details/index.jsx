// Dependencies
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Components
import {
  PedalboardDetails
} from 'components';

// Services
import {
  PedalboardService
} from 'services';

// Style
import './style.scss';

const PedalboardDetailsPage = ({ match }) => {
  const initialPlugin = undefined;
  const [plugin, setPlugin] = useState(initialPlugin);

  useEffect(() => {
    const {
      params: {
        id: pluginId
      } = {}
    } = match;

    PedalboardService.getPlugin(pluginId)
      .then((response) => {
        setPlugin(response.data);
      })
      .catch((error) => {
        console.log('getPlugins faild : ', error);
      });
  });

  return (
    <div className="pedalboard-details-container">
      {plugin
        ? <PedalboardDetails {...plugin} />
        : <p>Pas de données disponible</p>
      }
    </div>
  );
};

PedalboardDetailsPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }).isRequired
};

export default PedalboardDetailsPage;
