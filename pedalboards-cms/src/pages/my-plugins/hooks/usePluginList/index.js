// Dependencies
import { useState, useEffect, useRef } from 'react';

// Service
import { PedalboardService } from 'services';

// Helpers
import { RequestHelper } from 'helpers';

// Constants
import { FIRST_PAGE, PAGE_SIZE, UNKNOWN_PAGE_COUNT } from '../../constants';

// Utils
import { isPageInRange } from '../../utils';

/**
 * Loads the plugins of my plugins one page at a time, filtered by the search of the address when
 * it has one. A new search reloads the list from the first page, and only the answer of the last
 * request updates the list or its error, never once the page is left.
 * @param {Object} [params]
 * @param {string} [params.search=''] search of the address, as `?name=gate`
 * @returns {{
 *   plugins: Object[],
 *   currentPage: number,
 *   pageCount: number,
 *   errorMessage: string,
 *   goToPage: (page: number) => void,
 *   deletePlugin: (id: string) => void
 * }} the plugins of the page, its number, the number of pages, the message of the last failed
 * request, a function that loads another page when it exists, and one that deletes a plugin then
 * reloads the page
 */
const usePluginList = ({ search = '' } = {}) => {
  const [plugins, setPlugins] = useState([]);
  const [currentPage, setCurrentPage] = useState(FIRST_PAGE);
  const [pageCount, setPageCount] = useState(UNKNOWN_PAGE_COUNT);
  const [errorMessage, setErrorMessage] = useState('');

  // Number of the last list request, so that an older answer never replaces a newer one
  const lastListRequest = useRef(0);
  // True once the page is left: the answers that arrive later update nothing
  const hasLeftPage = useRef(false);

  const showError = (error) => {
    setErrorMessage(RequestHelper.readErrorMessage(error));
  };

  const loadPlugins = ({ page }) => {
    const searchParams = new URLSearchParams(search);
    const hasSearch = Array.from(searchParams.keys()).length > 0;
    const pluginsRequest = hasSearch
      ? PedalboardService.findPlugins(searchParams, page, PAGE_SIZE)
      : PedalboardService.getPlugins(page, PAGE_SIZE);
    const request = lastListRequest.current + 1;
    const isLastRequest = () => !hasLeftPage.current && request === lastListRequest.current;

    lastListRequest.current = request;
    pluginsRequest.then((response) => {
      if (!isLastRequest()) return;

      const { data = [], currentPage: loadedPage = page, numberPages = 0 } = response;

      setPlugins(data);
      setCurrentPage(loadedPage);
      setPageCount(numberPages);
      setErrorMessage('');
    }, (error) => {
      if (isLastRequest()) showError(error);
    });
  };

  useEffect(() => {
    loadPlugins({ page: FIRST_PAGE });
  }, [search]);

  useEffect(() => () => {
    hasLeftPage.current = true;
  }, []);

  const goToPage = (page) => {
    if (!isPageInRange({ page, pageCount })) return;

    loadPlugins({ page });
  };

  // The API answers a delete with a page of every plugin: load the page again with the search
  const deletePlugin = (id) => {
    PedalboardService.deletePlugin(id, currentPage, PAGE_SIZE)
      .then(() => {
        if (!hasLeftPage.current) loadPlugins({ page: currentPage });
      }, (error) => {
        if (!hasLeftPage.current) showError(error);
      });
  };

  return {
    plugins, currentPage, pageCount, errorMessage, goToPage, deletePlugin
  };
};

export default usePluginList;
