// Dependencies
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Components
import { Pagination } from 'components';

// Service
import { PedalboardService } from 'services';

// Helpers
import { RequestHelper } from 'helpers';

// Utils
import { Env } from 'utils';

// Constants
import { FIRST_PAGE, PAGE_SIZE } from './constants';

// Style
import './style.scss';

const MyPlugins = ({ location = {} }) => {
  const homePageUrl = Env.get('frontend');

  const [plugins, setPlugins] = useState([]);
  const [elementCount, setElementCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(FIRST_PAGE);
  const [countPlugins, setCountPlugins] = useState(-1);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (error) => {
    setErrorMessage(RequestHelper.readErrorMessage(error));
  };

  // Loads one page of the plugins, filtered by the search of the address when it has one
  const loadPlugins = ({ page }) => {
    const searchParams = new URLSearchParams(location.search);
    const hasSearch = Array.from(searchParams.keys()).length > 0;
    const pluginsRequest = hasSearch
      ? PedalboardService.findPlugins(searchParams, page, PAGE_SIZE)
      : PedalboardService.getPlugins(page, PAGE_SIZE);

    pluginsRequest.then((response) => {
      const {
        data = [], count = 0, currentPage: loadedPage = page, numberPages = 0
      } = response;

      setPlugins(data);
      setElementCount(count);
      setCurrentPage(loadedPage);
      setCountPlugins(numberPages);
      setErrorMessage('');
    }, showError);
  };

  useEffect(() => {
    loadPlugins({ page: FIRST_PAGE });
  }, []);

  const setCurrentPageHandler = (pageNumber) => {
    const pageNumberIsNotValide = Number.isNaN(pageNumber)
      || (pageNumber >= elementCount)
      || (pageNumber <= 0);

    if (pageNumberIsNotValide) return;

    loadPlugins({ page: pageNumber });
  };

  // The API answers a delete with a page of every plugin: load the page again with the search
  const deletePluginHandler = (id) => {
    PedalboardService.deletePlugin(id, currentPage, PAGE_SIZE)
      .then(() => loadPlugins({ page: currentPage }), showError);
  };

  return (
    <section className="my-plugin-container">
      <header>
        <h1>Mes plugins</h1>
        <Link
          to="/plugin/add"
          className="btn bg-primary"
        >
          Ajouter un  plugin
        </Link>
      </header>
      {errorMessage && <p className="request-error" role="alert">{errorMessage}</p>}
      <main>
        {plugins && plugins.length > 0
          ? plugins.map(({ _id, name }) => (
            <div className="plugin" key={_id}>
              <h2 className="title">{name}</h2>
              <div className="controls">
                <a
                  href={`${homePageUrl}/plugin/${_id}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="btn bg-white"
                >
                  Voir

                </a>
                <Link to={`plugin/edit/${_id}`} className="btn bg-white">Éditer</Link>
                <button
                  type="button"
                  className="btn bg-white"
                  onClick={() => deletePluginHandler(_id)}
                >
                  Supprimer
                </button>
              </div>
            </div>))
          : <p>Vous n'avez ajouté aucun plugin</p>
        }
      </main>
      <footer>
        <Pagination
          currentPage={currentPage}
          elementCount={countPlugins}
          onCurrentPageChange={setCurrentPageHandler}
        />
      </footer>
    </section>
  );
};

MyPlugins.propTypes = {
  /** Address of the page, given by the router: its `search` filters the plugins, as `?name=gate` */
  location: PropTypes.shape({
    search: PropTypes.string
  })
};

export default MyPlugins;
