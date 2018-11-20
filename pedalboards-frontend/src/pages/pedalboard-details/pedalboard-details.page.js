import React from 'react';
import PropTypes from 'prop-types';

import "./pedalboard-details.page.scss";

import PedalboardDetails from "../../components/pedalboard-details/pedalboard-details";

const PedalboardDetailsPage = props =>
  <div className="pedalboard-details-container">
    {props.location ? <PedalboardDetails {...props.location.state.payload} /> : <p>Pas de données disponible</p>}
  </div>;

  
PedalboardDetailsPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      payload: PropTypes.object.isRequired
    })
  })
}

export default PedalboardDetailsPage;
