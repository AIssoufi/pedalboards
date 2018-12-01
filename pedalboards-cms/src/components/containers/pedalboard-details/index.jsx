// Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import { PedalboardDetails } from 'components/presentationals';

// Services
import PedalboardsService from 'services/pedalboards.service';

// CSS
import "./style.scss";

class PedalboardDetailsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugin: null
    }
  }
  componentDidMount() {
    PedalboardsService.getPlugin(this.props.match.params.id)
      .then(response => this.setState({
        plugin: response.data
      }));
  }
  render() {
    return (
      <div className="pedalboard-details-container">
        {this.state.plugin ? <PedalboardDetails {...this.state.plugin} /> : <p>Pas de données disponible</p>}
      </div>
    );
  }
}





PedalboardDetailsPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      payload: PropTypes.object.isRequired
    })
  })
}

export default PedalboardDetailsPage;
