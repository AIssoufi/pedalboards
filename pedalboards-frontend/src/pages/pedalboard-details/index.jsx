// Dependencies
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

// Components
import {
  PedalboardDetails
} from '../../components';

// Services
import {
  PedalboardService
} from '../../services';

// Style
import './style.scss';

/**
 * Page of one plugin, the one of the `id` parameter of its route: shows the loader while the
 * plugin is fetched, then its details, an empty state when the answer holds no plugin, or an
 * error message when the request fails.
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
    if (hasFailed) return <p role="alert">Impossible de charger ce plugin, réessayez plus tard.</p>;
    if (hasContent) return <PedalboardDetails isLoading={isFetching} {...plugin} />;
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
