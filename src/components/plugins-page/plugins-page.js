import React, { Component } from 'react';

// CSS
import "./plugins-page.scss";

// Services
import PedalboardsService from '../../services/pedalboardsService';

// Componenets
import Plugin from './plugin/plugin';

class PluginsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: []
    }
  }

  componentDidMount() {
    PedalboardsService.getPlugins()
      .then(response => {
        console.log(response.json());
        // this.setState({
        //   plugins: response.items
        // });
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <div className="plugins-page-container">
        <header>
          <h2>Plugins</h2>
          <p>Here be plugins</p>
          <hr />
        </header>
        {this.state.plugins ? 
          this.state.plugins.map(plugin => <Plugin data={plugin} />) :
          null}
      </div>
    );
  }

};

export default PluginsPage;