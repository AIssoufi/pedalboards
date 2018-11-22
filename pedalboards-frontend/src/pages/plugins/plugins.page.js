// Dependencies
import React, { Component } from 'react';

// CSS
import "./plugins.page.scss";

// Services
import PedalboardsService from 'services/pedalboards.service';

// Componenets
import Plugin from 'components/plugin/plugin';
import Search from 'components/search/search';

class PluginsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      elementCount: 0,
      displayNumber: 10,
      currentPage: 1
    }
  }

  componentDidMount() {
    ((this.props.location && this.props.location.search) ?
      PedalboardsService.findPlugins(
        new URLSearchParams(this.props.location.search),
        this.state.currentPage,
        this.state.displayNumber
      ) : PedalboardsService.getPlugins(
        this.state.currentPage,
        this.state.displayNumber
      )).then(response => {
        this.setState({
          plugins: response.data,
          elementCount: response.count
        });
      })
  }

  componentDidUpdate(prevProps) {
    if (this.props.location && prevProps.location && this.props.location.search !== prevProps.location.search) {
      PedalboardsService.findPlugins(
        new URLSearchParams(this.props.location.search),
        this.state.currentPage,
        this.state.displayNumber
      ).then(response => {
        this.setState({
          plugins: response.data,
          elementCount: response.count
        });
      }).catch(error => console.log(error));
    }
  }

  getNumberOfPages() {
    return Math.ceil(this.state.elementCount / this.state.displayNumber);
  }

  handleSearchSubmit = formData => {
    const label = formData.get('label');
    const value = formData.get('value');
    if (!value) return;

    const searchParams = new URLSearchParams();
    searchParams.append(label || 'label', value);
    PedalboardsService.findPlugins(
      searchParams,
      this.state.currentPage,
      this.state.displayNumber
    ).then(response => {
      this.setState({
        plugins: response.data,
        elementCount: response.count
      });
    }).catch(error => console.log(error));
  }

  render() {
    return (
      <div className="plugins-page-container">
        <header>
          <h2>Plugins</h2>
          <p>Here be plugins</p>
          <hr />
        </header>
        <Search onChange={null} onSubmit={this.handleSearchSubmit} />
        <div className="plugin-container">
          {this.state.plugins ?
            this.state.plugins.map(plugin => <Plugin key={plugin._id} {...plugin} />) :
            <p>Aucun plugin n'est disponible</p>}
        </div>
      </div>
    );
  }

};

export default PluginsPage;