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
 * plugin is fetched, then its details, or an empty state when the answer holds no plugin.
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
  const hasContent = isFetching || Boolean(plugin);

  useEffect(() => {
    // A route without an id names no plugin, so the page shows its empty state at once
    if (!pluginId) return undefined;

    let fetchedPlugin;
    // False once the id changes, so a late answer for the previous id is ignored
    let isCurrentId = true;

    PedalboardService.getPlugin(pluginId)
      .then((response) => {
        fetchedPlugin = response?.data;
      })
      .finally(() => {
        if (isCurrentId) setFetched({ pluginId, plugin: fetchedPlugin });
      });

    return () => {
      isCurrentId = false;
    };
  }, [pluginId]);

  return (
    <div className="pedalboard-details-wrapper">
      <div className="details-container">
        {hasContent
          ? <PedalboardDetails isLoading={isFetching} {...plugin} />
          : <p>Pas de données disponible</p>
        }
      </div>
    </div>
  );
};

export default PedalboardDetailsPage;
