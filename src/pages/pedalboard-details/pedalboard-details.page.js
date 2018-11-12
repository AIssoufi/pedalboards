import React from 'react';
import PropTypes from 'prop-types';

import "./pedalboard-details.page.scss";

import PedalboardDetails from "../../components/pedalboard-details/pedalboard-details";

const PedalboardDetailsPage = props =>
  props.location ? <PedalboardDetails {...props.location.state.payload} /> : <p>Pas de données disponible</p>
  ;

PedalboardDetailsPage.propTypes = {

}

export default PedalboardDetailsPage;
