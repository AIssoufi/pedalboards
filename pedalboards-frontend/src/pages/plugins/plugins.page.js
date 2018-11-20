// Dependencies
import React, { Component } from 'react';

// CSS
import "./plugins.page.scss";

// Services
import PedalboardsService from '../../services/pedalboards.service';

// Componenets
import Plugin from '../../components/plugin/plugin';
import Search from '../../components/search/search';

class PluginsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      filter: {
        category: props.location ? props.location.search : null
      }
    }
  }

  componentDidMount() {
    PedalboardsService.getPlugins()
      .then(response => response.json())
      .then(data => {
        console.log(data.data);
        this.setState({
          plugins: data.data,
          category: this.props.location ? this.props.location.search : null
        });
      })
      .catch(error => console.log(error));
  }

  getURLSearchParams() {

  }

  render() {
    return (
      <div className="plugins-page-container">
        <header>
          <h2>Plugins</h2>
          <p>Here be plugins</p>
          <hr />
        </header>
        <Search onChange={null} onSubmit={null} />
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