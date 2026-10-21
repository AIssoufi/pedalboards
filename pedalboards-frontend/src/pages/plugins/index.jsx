// Dependencies
import { useEffect } from 'react';
import { connect } from 'react-redux';
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
 */
const PluginsPage = ({
  location = {}, history = {}, fetchPlugins, findPlugins, plugins = [], countPlugins = 0,
  isFetching = false
}) => {
  const { pathname, search = '' } = location;
  const { filters, page: currentPage } = parsePluginsSearch(search);

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
    // The search field calls a handler of an earlier render after its debounce delay, so the
    // URL shown now comes from the history, which the router keeps up to date
    const { location: shownLocation = location } = history;
    const { search: shownSearch = '' } = shownLocation || {};
    const isNewSearch = nextSearch !== shownSearch;
    const canNavigate = isNewSearch && typeof history.push === 'function';

    if (canNavigate) history.push({ pathname, search: nextSearch });
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
  /** Location of the page, from the router: its query string holds the filter and the page. */
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string
  }),
  /**
   * History of the router, where a search or a page change pushes the new URL. Its location
   * gives the URL shown now, compared with the new one so that a URL is never pushed twice.
   */
  history: PropTypes.shape({
    location: PropTypes.shape({
      search: PropTypes.string
    }),
    push: PropTypes.func
  }),
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
