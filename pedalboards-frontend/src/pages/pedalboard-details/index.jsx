// Dependencies
import {
  lazy, Suspense, useState, useEffect
} from 'react';
import { Link, useParams } from 'react-router';

// Components
import {
  ErrorBoundary,
  Loader
} from '../../components';

// Services
import {
  PedalboardService
} from '../../services';

// Constants
import { PLUGINS_PATHNAME } from '../../constants/routes';

// Utils
import { buildPageTitle } from '../../utils/page-title';
import { isPluginLabelShown } from '../../utils/plugin-label';
import { isPluginNotFound } from './utils';

// Style
import './style.scss';

// The details, their helpers and their style load in their own chunk, which the plugins page
// never downloads. The page itself stays in the main chunk, so that it fetches the plugin while
// that chunk loads, and shows the loader in its card meanwhile, as while the plugin is fetched
const PedalboardDetails = lazy(() => import('../../components/pedalboard-details'));

// Names the page whenever the label of a plugin does not: while it loads, when it fails or is
// unknown, when there is no plugin or when the plugin has no label
const PAGE_NAME = 'Plugin';

// Titles the page for screen readers in those cases
const PAGE_TITLE = <h1 className="visually-hidden" tabIndex={-1}>{PAGE_NAME}</h1>;

// Shown when the plugin or the chunk of its details fails to load, unless the id is unknown
const LOAD_ERROR_CONTENT = (
  <>
    {PAGE_TITLE}
    <p role="alert">Could not load this plugin, try again later.</p>
  </>
);

// Shown while the chunk of the details loads
const LOADING_CONTENT = (
  <>
    {PAGE_TITLE}
    <Loader />
  </>
);

// Shown when the answer holds no plugin, or the route names none
const EMPTY_STATE_TEXT = 'No data available';

const EMPTY_CONTENT = (
  <>
    {PAGE_TITLE}
    <p>{EMPTY_STATE_TEXT}</p>
  </>
);

// Shown when the API knows no plugin of that id, where retrying cannot help
const NOT_FOUND_CONTENT = (
  <>
    {PAGE_TITLE}
    <p role="alert">
      This plugin does not exist. <Link to={PLUGINS_PATHNAME}>See the list of plugins</Link>
    </p>
  </>
);

/**
 * Page of one plugin, the one of the `id` parameter of its route: shows the loader while the
 * plugin is fetched, then its details, an empty state when the answer holds no plugin, a
 * not-found message with a link to the list when the API knows no plugin of that id, or an error
 * message when the request or the chunk of the details fails otherwise. The label of the plugin
 * titles the page; a visually hidden "Plugin" title replaces it in every other case.
 */
const PedalboardDetailsPage = () => {
  const { id: pluginId } = useParams();
  // The plugin of the last answer, with the id it answered, so the page fetches while the id of
  // its route has no answer yet, without setting a state when the fetch starts
  const [fetched, setFetched] = useState({});
  const hasAnswer = fetched.pluginId === pluginId;
  // A route without an id fetches nothing, so it never waits for an answer
  const isFetching = Boolean(pluginId) && !hasAnswer;
  const plugin = hasAnswer ? fetched.plugin : undefined;
  const hasFailed = hasAnswer && fetched.hasFailed === true;
  const isNotFound = hasFailed && fetched.isNotFound === true;
  const hasContent = isFetching || Boolean(plugin);
  // The details render the label as the title of the page once the plugin is loaded: no plugin
  // is known while it is fetched
  const isLabelShown = isPluginLabelShown(plugin?.label);

  useEffect(() => {
    // A route without an id names no plugin, so the page shows its empty state at once
    if (!pluginId) return undefined;

    // False once the id changes, so a late answer for the previous id is ignored
    let isCurrentId = true;

    PedalboardService.getPlugin(pluginId)
      .then((response) => {
        if (isCurrentId) setFetched({ pluginId, plugin: response?.data });
      })
      .catch((error) => {
        if (isCurrentId) setFetched({ pluginId, hasFailed: true, isNotFound: isPluginNotFound(error) });
      });

    return () => {
      isCurrentId = false;
    };
  }, [pluginId]);

  // The not-found or the error message, the loader or the details, or the empty state when there
  // is no plugin
  const renderContent = () => {
    if (isNotFound) return NOT_FOUND_CONTENT;
    if (hasFailed) return LOAD_ERROR_CONTENT;
    if (hasContent) {
      // A chunk that fails to load, on a lost connection or after a deploy that removed it, shows
      // the error message rather than unmounting the app
      return (
        <ErrorBoundary fallback={LOAD_ERROR_CONTENT}>
          <Suspense fallback={LOADING_CONTENT}>
            {!isLabelShown && PAGE_TITLE}
            <PedalboardDetails isLoading={isFetching} {...plugin} />
          </Suspense>
        </ErrorBoundary>
      );
    }
    return EMPTY_CONTENT;
  };

  return (
    <div className="pedalboard-details-wrapper">
      <title>{buildPageTitle(isLabelShown ? plugin.label : PAGE_NAME)}</title>
      <div className="details-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default PedalboardDetailsPage;
