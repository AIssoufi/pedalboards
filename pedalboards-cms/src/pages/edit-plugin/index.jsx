// Dependencies
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Components
import { AddPlugin } from 'components';

// Services
import { PedalboardService } from 'services';

/**
 * Page that edits the plugin of the route id: it loads the plugin, then fills the plugin form
 * with it.
 */
const EditPlugin = ({ match = {} }) => {
  const [plugin, setPlugin] = useState({});
  const { params: { id } = {} } = match;

  useEffect(() => {
    if (id) {
      PedalboardService.getPlugin(id)
        .then((response) => {
          const { data = {} } = response;

          setPlugin(data);
        });
    }
  }, []);

  // The key mounts a new form once the plugin is loaded, since its fields read their values once
  return <AddPlugin key={plugin._id} {...plugin} edit id={id} />;
};

EditPlugin.propTypes = {
  /** Match of the route, given by the router: its `params.id` names the plugin to edit */
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

export default EditPlugin;
