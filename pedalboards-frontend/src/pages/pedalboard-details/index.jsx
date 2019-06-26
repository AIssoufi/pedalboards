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
  const [isFetching, setIsFetching] = useState(false);
  const [plugin, setPlugin] = useState(initialPlugin);

  useEffect(() => {
    const {
      params: {
        id: pluginId
      } = {}
    } = match;

    setIsFetching(true);

    PedalboardService.getPlugin(pluginId)
      .then((response) => {
        setPlugin(response.data);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  return (
    <div className="pedalboard-details-container">
      {isFetching || plugin
        ? <PedalboardDetails isLoading={isFetching} {...plugin} />
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
