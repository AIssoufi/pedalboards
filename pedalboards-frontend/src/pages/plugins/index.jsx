// Dependencies
import { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useSearchParams } from 'react-router';
import PropTypes from 'prop-types';

// Componenets
import {
  Search, Pagination, PluginGrid
} from '../../components';

// Redux - selectors
import { pluginSelector } from '../../redux/selectors';

// Redux - actions
import {
  fetchPluginsAction, findPluginsAction
} from '../../redux/actions/plugin.action';

// Utils
import {
  buildPluginsSearch, createPluginFilters, isValidPage, parsePluginsSearch
} from '../../utils/plugin-filter';

// Style
import './style.scss';

// Number of plugins on each page
const PAGE_SIZE = 10;

/**
 * Page listing the plugins, with a search, numbered pages and the grid of plugin cards. Its URL
 * holds the filter and the page (`?brand=MDA&page=2`): a search, a page change or a filter link
 * of a card changes the URL, and the page fetches the plugins of each new URL.
 * It renders inside a router, since it reads and writes its query string with useSearchParams.
 */
const PluginsPage = ({
  fetchPlugins, findPlugins, plugins = [], countPlugins = 0, isFetching = false
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const { filters, page: currentPage } = parsePluginsSearch(search);
  // The search field calls a handler of an earlier render after its debounce delay, so the
  // handlers compare a new search with this ref, which holds the search of the URL shown now
  const shownSearchRef = useRef(search);

  useEffect(() => {
    shownSearchRef.current = search;
  }, [search]);

  // filters and currentPage are derived from search, so search alone tells when they change
  useEffect(() => {
    const hasFilters = [...filters.keys()].length > 0;
    const canFindPlugins = hasFilters && typeof findPlugins === 'function';
    const canFetchPlugins = !hasFilters && typeof fetchPlugins === 'function';

    if (canFindPlugins) findPlugins(filters, currentPage, PAGE_SIZE);
    if (canFetchPlugins) fetchPlugins(currentPage, PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search tells when filters change
  }, [search]);

  const showSearch = (nextSearch) => {
    const isNewSearch = new URLSearchParams(nextSearch).toString() !== shownSearchRef.current;

    if (isNewSearch) setSearchParams(nextSearch);
  };

  const handleSearchSubmit = (formData) => {
    const searchFilters = createPluginFilters({
      field: formData.get('label'),
      value: formData.get('value')
    });

    showSearch(buildPluginsSearch({ filters: searchFilters }));
  };

  const setCurrentPageHandler = (pageNumber) => {
    if (!isValidPage({ page: pageNumber, pageCount: countPlugins })) return;

    showSearch(buildPluginsSearch({ filters, page: pageNumber }));
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
  /** Fetches a page of all the plugins, from the store. Nothing is fetched without it. */
  fetchPlugins: PropTypes.func,
  /** Fetches a page of the plugins matching filters, from the store, as fetchPlugins. */
  findPlugins: PropTypes.func,
  /** Plugins of the page shown. @default [] */
  plugins: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    brand: PropTypes.string
  })),
  /** Number of pages of the results. @default 0 */
  countPlugins: PropTypes.number,
  /** Whether the plugins are being fetched. @default false */
  isFetching: PropTypes.bool
};

export { PluginsPage };
export default connect(mapStateToProps, mapDispatchToProps)(PluginsPage);
