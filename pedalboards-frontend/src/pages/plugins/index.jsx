// Dependencies
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';

// Components
import {
  Search, Pagination, PluginGrid
} from '../../components';

// Redux
import { loadPlugins, selectPluginsPage } from '../../redux/plugins/slice';

// Utils
import {
  buildLastPageSearch,
  buildPluginsSearch,
  createPluginFilters,
  getSearchFilter,
  isValidPage,
  parsePluginsSearch
} from '../../utils/plugin-filter';

// Style
import './style.scss';

// Number of plugins on each page
const PAGE_SIZE = 10;
// Shown in place of the grid when the plugins fail to load
const LOAD_ERROR_TEXT = 'Could not load the plugins, try again later.';
// Names the list for a screen reader once a page change moves the focus to it
const LIST_LABEL = 'Plugin list';

// A failed or dropped request already shows its state through the store
const ignoreFailure = () => {};

/**
 * Page listing the plugins, with a search, numbered pages and the grid of plugin cards. Its URL
 * holds the filter and the page (`?brand=MDA&page=2`): a search, a page change or a filter link
 * of a card changes the URL, and the page fetches the plugins of each new URL. A page past the
 * last one, such as `?page=999`, is replaced in the history by the last page of the results.
 * It renders inside a router, since it reads and writes its query string with useSearchParams,
 * and inside the Redux store, which loads the plugins. A failed request shows an error message in
 * place of the grid. Coming back to the URL of the list in the store shows it at once, and reloads
 * it behind the scenes, so that the browser restores the scroll position. A page change from the
 * pagination below the list moves the focus to the top of the list.
 */
const PluginsPage = () => {
  const dispatch = useDispatch();
  const listRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const {
    plugins, pageCount, isLoading, hasFailed
  } = useSelector(rootState => selectPluginsPage({ rootState, search }));
  const { filters, page: currentPage } = parsePluginsSearch(search);
  const searchFilter = getSearchFilter(filters);

  // filters and currentPage are derived from search, so search alone tells when they change
  useEffect(() => {
    let isCurrentSearch = true;
    const request = dispatch(loadPlugins({
      filters, page: currentPage, pageSize: PAGE_SIZE, search
    }));

    // The count of this answer, not the one of the store, which a new search leaves stale
    request.unwrap().then(({ pageCount: answerPageCount }) => {
      const lastPageSearch = buildLastPageSearch({
        filters, page: currentPage, pageCount: answerPageCount
      });
      const shouldGoToLastPage = isCurrentSearch && lastPageSearch !== null;

      // Replaced, so that going back skips the page that does not exist
      if (shouldGoToLastPage) setSearchParams(lastPageSearch, { replace: true });
    }, ignoreFailure);

    // A new search, or leaving the page, drops the answer of this one
    return () => {
      isCurrentSearch = false;
      request.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search tells when filters change
  }, [search, dispatch]);

  const showSearch = (nextSearch) => {
    const isNewSearch = new URLSearchParams(nextSearch).toString() !== search;

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
    if (!isValidPage({ page: pageNumber, pageCount })) return;

    showSearch(buildPluginsSearch({ filters, page: pageNumber }));
  };

  // The list stays in the page while the loader replaces its grid, so the focus is not lost
  const setPageFromBelowHandler = (pageNumber) => {
    if (!isValidPage({ page: pageNumber, pageCount })) return;

    setCurrentPageHandler(pageNumber);
    listRef.current?.focus();
  };

  return (
    <div className="plugins-page-container">
      <header>
        <h1>Plugins</h1>
        <p>Here be plugins</p>
        <hr />
      </header>
      <Search
        value={searchFilter.value}
        field={searchFilter.field}
        onSubmit={handleSearchSubmit}
      />
      <Pagination
        currentPage={currentPage}
        elementCount={pageCount}
        onCurrentPageChange={setCurrentPageHandler}
      />
      <section ref={listRef} aria-label={LIST_LABEL} tabIndex={-1}>
        {hasFailed
          ? <p role="alert">{LOAD_ERROR_TEXT}</p>
          : <PluginGrid isLoading={isLoading} plugins={plugins} />}
      </section>
      <Pagination
        currentPage={currentPage}
        elementCount={pageCount}
        onCurrentPageChange={setPageFromBelowHandler}
      />
    </div>
  );
};

export default PluginsPage;
