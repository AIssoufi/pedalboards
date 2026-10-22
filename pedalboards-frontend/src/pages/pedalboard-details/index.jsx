// Dependencies
import {
  lazy, Suspense, useState, useEffect
} from 'react';
import { useParams } from 'react-router';

// Components
import {
  ErrorBoundary,
  Loader
} from '../../components';

// Services
import {
  PedalboardService
} from '../../services';

// Style
import './style.scss';

// The details, their helpers and their style load in their own chunk, which the plugins page
// never downloads. The page itself stays in the main chunk, so that it fetches the plugin while
// that chunk loads, and shows the loader in its card meanwhile, as while the plugin is fetched
const PedalboardDetails = lazy(() => import('../../components/pedalboard-details'));

// Shown when the plugin or the chunk of its details fails to load
const LOAD_ERROR_ALERT = <p role="alert">Impossible de charger ce plugin, réessayez plus tard.</p>;

/**
 * Page of one plugin, the one of the `id` parameter of its route: shows the loader while the
 * plugin is fetched, then its details, an empty state when the answer holds no plugin, or an
 * error message when the request or the chunk of the details fails.
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
      .catch(() => {
        if (isCurrentId) setFetched({ pluginId, hasFailed: true });
      });

    return () => {
      isCurrentId = false;
    };
  }, [pluginId]);

  // The error message, the loader or the details, or the empty state when there is no plugin
  const renderContent = () => {
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
    return <p>Pas de données disponible</p>;
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
