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
import { PLUGINS_PATHNAME } from '../../utils/plugin-filter/constants';

// Utils
import { isPluginNotFound } from './utils';

// Style
import './style.scss';

// The details, their helpers and their style load in their own chunk, which the plugins page
// never downloads. The page itself stays in the main chunk, so that it fetches the plugin while
// that chunk loads, and shows the loader in its card meanwhile, as while the plugin is fetched
const PedalboardDetails = lazy(() => import('../../components/pedalboard-details'));

// Shown when the plugin or the chunk of its details fails to load, unless the id is unknown
const LOAD_ERROR_ALERT = (
  <p role="alert" lang="fr">Impossible de charger ce plugin, réessayez plus tard.</p>
);

// Shown when the answer holds no plugin, or the route names none
const EMPTY_STATE_TEXT = 'Pas de données disponibles';

// Shown when the API knows no plugin of that id, where retrying cannot help
const NOT_FOUND_ALERT = (
  <p role="alert" lang="fr">
    Ce plugin est introuvable. <Link to={PLUGINS_PATHNAME}>Voir la liste des plugins</Link>
  </p>
);

/**
 * Page of one plugin, the one of the `id` parameter of its route: shows the loader while the
 * plugin is fetched, then its details, an empty state when the answer holds no plugin, a
 * not-found message with a link to the list when the API knows no plugin of that id, or an error
 * message when the request or the chunk of the details fails otherwise.
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
    if (isNotFound) return NOT_FOUND_ALERT;
    if (hasFailed) return LOAD_ERROR_ALERT;
    if (hasContent) {
      // A chunk that fails to load, on a lost connection or after a deploy that removed it, shows
      // the error message rather than unmounting the app
      return (
        <ErrorBoundary fallback={LOAD_ERROR_ALERT}>
          <Suspense fallback={<Loader />}>
            <PedalboardDetails isLoading={isFetching} {...plugin} />
          </Suspense>
        </ErrorBoundary>
      );
    }
    return <p lang="fr">{EMPTY_STATE_TEXT}</p>;
  };

  return (
    <div className="pedalboard-details-wrapper">
      <div className="details-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default PedalboardDetailsPage;
