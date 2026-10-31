// The details of a plugin are not exported here: the details page loads them in their own chunk,
// which an import from this barrel would bring back into the main one
import ErrorBoundary from './error-boundary';
import Header from './header';
import Loader from './loader';
import Main from './main';
import Pagination from './pagination';
import Plugin from './plugin';
import PluginGrid from './plugin-grid';
import Search from './search';
import Tooltip from './tooltip';

export {
  ErrorBoundary,
  Header,
  Loader,
  Main,
  Pagination,
  Plugin,
  PluginGrid,
  Search,
  Tooltip
};
