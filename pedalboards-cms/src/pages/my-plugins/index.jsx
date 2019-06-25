// Dependencies
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Components
import { Pagination } from 'components';

// Service
import { PedalboardService } from 'services';

// Utils
import { Env } from 'utils';

// Style
import './style.scss';

const MyPlugins = ({ location }) => {
  const displayNumber = 10;
  const homePageUrl = Env.get('frontend');

  const [plugins, setPlugins] = useState([]);
  const [elementCount, setElementCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [countPlugins, setCountPlugins] = useState(-1);
  const [deletedCount, setDeletedCount] = useState(null);

  useEffect(() => {
    const { search } = location;

    const fetchPlugin = () => (
      search ? () => {
        const searchParams = new URLSearchParams(search);

        return PedalboardService.findPlugins(
          searchParams,
          currentPage,
          displayNumber
        );
      } : PedalboardService.getPlugins(currentPage, displayNumber)
    );

    fetchPlugin().then((response) => {
      const { data, count, numberPages } = response;

      setPlugins(data);
      setElementCount(count);
      setCountPlugins(numberPages);
    });
  }, []);

  const setCurrentPageHandler = (pageNumber) => {
    const pageNumberIsNotValide = Number.isNaN(pageNumber)
      || (pageNumber >= elementCount)
      || (pageNumber <= 0);

    if (pageNumberIsNotValide) return;

    PedalboardService.getPlugins(
      pageNumber,
      displayNumber
    ).then((response) => {
      const {
        data, count, currentPage: newPage, numberPages
      } = response;

      setPlugins(data);
      setElementCount(count);
      setCurrentPage(newPage);
      setCountPlugins(numberPages);
    });
  };

  const deletePluginHandler = (id) => {
    PedalboardService.deletePlugin(id, currentPage, displayNumber)
      .then((response) => {
        const {
          data, count, currentPage: newPage, numberPages, deletedCount: newDeletedCount
        } = response;

        setPlugins(data);
        setElementCount(count);
        setCurrentPage(newPage);
        setCountPlugins(numberPages);
        setDeletedCount(newDeletedCount);
      });
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
  location: PropTypes.object.isRequired
};

export default MyPlugins;
