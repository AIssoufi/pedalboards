// Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// Components
import { Pagination } from 'components/presentationals';

// Service
import { PedalboardsService } from 'services';

// CSS
import './style.scss';

export default class MyPlugins extends Component {
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
      <section className="my-plugin-container">
        <header>
          <h1>Mes plugins</h1>
          <Link to="plugin/add" className="btn bg-primary">Ajouter un  plugin</Link>
        </header>
        <main>
          {this.state.plugins && this.state.plugins.length > 0 ?
            this.state.plugins.map(plugin => (
              <div className="plugin">
                <h2 className="title">{plugin.name}</h2>
                <div className="controls">
                  <Link to={`plugin/${plugin.id}`} className="btn bg-white">Voir</Link>
                  <Link to={`plugin/edit/${plugin.id}`} className="btn bg-white">Éditer</Link>
                  <button type="button" className="btn bg-white">Supprimer</button>
                </div>
              </div>)) :
            <p>Vous n'avez ajouté aucun plugin</p>
          }
        </main>
        <footer>
          <Pagination
            currentPage={this.state.currentPage}
            elementCount={this.state.countPlugins}
            onCurrentPageChange={this.setCurrentPage}
          />
        </footer>
      </section>
    )
  }
}