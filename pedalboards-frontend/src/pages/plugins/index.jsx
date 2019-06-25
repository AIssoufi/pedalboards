// Dependencies
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Componenets
import {
  Plugin, Search, Pagination
} from 'components';

// Services
import {
  PedalboardService
} from 'services';

// Style
import './style.scss';

const PluginsPage = ({ location }) => {
  const displayNumber = 10;

  const [plugins, setPlugins] = useState([]);
  const [elementCount, setElementCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [countPlugins, setCountPlugins] = useState(-1);

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

  const handleSearchSubmit = (formData) => {
    const label = formData.get('label');
    const value = formData.get('value');
    const searchParams = new URLSearchParams();

    searchParams.append(label, value);

    PedalboardService.findPlugins(
      searchParams,
      currentPage,
      displayNumber
    ).then((response) => {
      const {
        data, count, numberPages
      } = response;

      setPlugins(data);
      setElementCount(count);
      setCountPlugins(numberPages);
    }).catch((error) => {
      console.log('findPlugins faild : ', error);
    });
  };

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

  return (
    <div className="plugins-page-container">
      <header>
        <h2>Plugins</h2>
        <p>Here be plugins</p>
        <hr />
      </header>
      <Search
        onChange={null}
        onSubmit={handleSearchSubmit}
      />
      <Pagination
        currentPage={currentPage}
        elementCount={countPlugins}
        onCurrentPageChange={setCurrentPageHandler}
      />
      <div className="plugin-container">
        {plugins.length > 0
          ? plugins.map(
            p => <Plugin key={p._id} {...p} />
          )
          : <p>Aucun plugin ne correspond à votre recherche !</p>}
      </div>
      <Pagination
        currentPage={currentPage}
        elementCount={countPlugins}
        onCurrentPageChange={setCurrentPageHandler}
      />
    </div>
  );
};

PluginsPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string
  }).isRequired
};

export default PluginsPage;
