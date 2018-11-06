import React, { Component } from 'react';

// CSS
import "./plugins.page.scss";

// Services
import PedalboardsService from '../../services/pedalboardsService';

// Componenets
import Plugin from '../../components/plugin/plugin';

class PluginsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: []
    }
  }

  componentDidMount() {
    PedalboardsService.getPlugins()
      .then(response => response.json())
      .then(data => {
        console.log(data.items);
        this.setState({
          plugins: data.items
        });
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
        <div className="plugin-container">
          {this.state.plugins ?
            this.state.plugins.map(plugin => <Plugin {...plugin} />) :
            <p>Aucun plugin n'est disponible</p>}
        </div>
      </div>
    );
  }

};

export default PluginsPage;