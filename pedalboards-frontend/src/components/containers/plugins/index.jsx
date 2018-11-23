// Dependencies
import React, { Component } from 'react';

// CSS
import "./style.scss";

// Services
import PedalboardsService from 'services/pedalboards.service';

// Componenets
import {
  Plugin,
  Search,
  Pagination
} from 'components/presentationals';

class PluginsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      elementCount: 0,
      displayNumber: 10,
      currentPage: 1,
      countPlugins: -1
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
          elementCount: response.count,
          countPlugins: response.numberPages
        });
      })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.location && prevProps.location && this.props.location.search !== prevProps.location.search) {
      PedalboardsService.findPlugins(
        new URLSearchParams(this.props.location.search),
        this.state.currentPage,
        this.state.displayNumber
      ).then(response => {
        this.setState({
          plugins: response.data,
          elementCount: response.count,
          countPlugins: response.numberPages
        });
      }).catch(error => console.log(error));
    }
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
        elementCount: response.count,
        countPlugins: response.numberPages
      });
    }).catch(error => console.log(error));
  }

  setCurrentPage = (pageNumber) => {
    if (isNaN(pageNumber) || pageNumber >= this.state.elementCount || pageNumber <= 0) return;

    PedalboardsService.getPlugins(
      pageNumber,
      this.state.displayNumber
    ).then(response => {
      this.setState({
        plugins: response.data,
        elementCount: response.count,
        currentPage: response.currentPage,
        countPlugins: response.numberPages
      });
    });
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
        <Pagination
          currentPage={this.state.currentPage}
          elementCount={this.state.countPlugins}
          onCurrentPageChange={this.setCurrentPage}
        />
        <div className="plugin-container">
          {this.state.plugins ?
            this.state.plugins.map(plugin => <Plugin key={plugin._id} {...plugin} />) :
            <p>Aucun plugin n'est disponible</p>}
        </div>
        <Pagination
          currentPage={this.state.currentPage}
          elementCount={this.state.countPlugins}
          onCurrentPageChange={this.setCurrentPage}
        />
      </div>
    );
  }

};

export default PluginsPage;