// Dependencies
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Components
import { AddPlugin } from 'components';

// Services
import { PedalboardService } from 'services';

const EditPlugin = ({ match }) => {
  const [plugin, setPlugin] = useState({});

  useEffect(() => {
    const {
      params: {
        id
      } = {}
    } = match;

    if (id) {
      PedalboardService.getPlugin(id)
        .then((response) => {
          const { data } = response;

          setPlugin(data);
        });
    }
  }, []);

  return <AddPlugin edit {...plugin} />;
};

EditPlugin.propTypes = {
  match: PropTypes.object.isRequired
};

export default EditPlugin;
