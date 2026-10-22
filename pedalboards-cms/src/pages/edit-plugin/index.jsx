// Dependencies
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Components
import { AddPlugin, RequestError } from 'components';

// Services
import { PedalboardService } from 'services';

// Helpers
import { RequestHelper } from 'helpers';

/**
 * Page that edits the plugin of the route id: it loads the plugin, then fills the plugin form
 * with it. A new route id loads its plugin, and an answer for a previous id is ignored.
 */
const EditPlugin = ({ match = {} }) => {
  const [plugin, setPlugin] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const { params: { id } = {} } = match;

  useEffect(() => {
    if (!id) return undefined;

    // False once the route names another plugin or the page is left: the answer is then ignored
    let isRoutePlugin = true;

    PedalboardService.getPlugin(id)
      .then((response) => {
        if (!isRoutePlugin) return;

        const { data = {} } = response;

        setPlugin(data);
        setErrorMessage('');
      }, (error) => {
        if (isRoutePlugin) setErrorMessage(RequestHelper.readErrorMessage(error));
      });

    return () => {
      isRoutePlugin = false;
    };
  }, [id]);

  return (
    <>
      <RequestError message={errorMessage} />
      {/* The key mounts a new form once the plugin is loaded: its fields read their values once */}
      <AddPlugin key={plugin._id} {...plugin} edit id={id} />
    </>
  );
};

EditPlugin.propTypes = {
  /**
   * Match of the route, given by the router: its `params.id` names the plugin to edit.
   * @default {}
   */
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

export default EditPlugin;
