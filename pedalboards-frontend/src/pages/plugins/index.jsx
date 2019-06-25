// Dependencies
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// Componenets
import {
  Search, Pagination, PluginGrid
} from 'components';

// Redux - selectors
import { pluginSelector } from 'redux/selectors';

// Redux - actions
import {
  fetchPluginsAction, findPluginsAction
} from 'redux/actions/plugin.action';

// Style
import './style.scss';

const PluginsPage = ({
  location, fetchPlugins, findPlugins, plugins,
  elementCount, countPlugins, isFetching
}) => {
  const displayNumber = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const { search } = location;

    if (search) {
      const searchParams = new URLSearchParams(search);
      findPlugins(
        searchParams,
        currentPage,
        displayNumber
      );
    } else {
      fetchPlugins(currentPage, displayNumber);
    }
  }, []);

  const handleSearchSubmit = (formData) => {
    const label = formData.get('label');
    const value = formData.get('value');
    const searchParams = new URLSearchParams();

    searchParams.append(label, value);

    findPlugins(
      searchParams,
      currentPage,
      displayNumber
    );
  };

  const setCurrentPageHandler = (pageNumber) => {
    const pageNumberIsNotValide = Number.isNaN(pageNumber)
      || (pageNumber >= elementCount)
      || (pageNumber <= 0);

    if (pageNumberIsNotValide) return;

    fetchPlugins(
      pageNumber,
      displayNumber
    ).then((response) => {
      const {
        currentPage: newPage
      } = response;

      setCurrentPage(newPage);
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
      <PluginGrid isLoading={isFetching} plugins={plugins} />
      <Pagination
        currentPage={currentPage}
        elementCount={countPlugins}
        onCurrentPageChange={setCurrentPageHandler}
      />
    </div>
  );
};

const mapDispatchToProps = {
  fetchPlugins: fetchPluginsAction,
  findPlugins: findPluginsAction
};

const mapStateToProps = pluginSelector;

PluginsPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string
  }).isRequired,
  fetchPlugins: PropTypes.func.isRequired,
  findPlugins: PropTypes.func.isRequired,
  plugins: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    brand: PropTypes.string
  })).isRequired,
  elementCount: PropTypes.number.isRequired,
  countPlugins: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(PluginsPage);
