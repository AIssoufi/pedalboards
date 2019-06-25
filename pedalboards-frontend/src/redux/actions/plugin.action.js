// Constants
import { PluginConstants } from 'redux/constants';

// Services
import {
  PedalboardService
} from 'services';

const {
  REQUEST_PLUGIN, RECEIVE_PLUGIN, CANCEL_PLUGIN_REQUEST
} = PluginConstants;

const requestPluginAction = () => ({
  type: REQUEST_PLUGIN
});

const receivePluginAction = ({ data, count, numberPages }) => ({
  type: RECEIVE_PLUGIN,
  payload: {
    data, count, numberPages
  }
});

const cancelPluginRequestAction = () => ({
  type: CANCEL_PLUGIN_REQUEST
});

function fetchPluginsAction({ currentPage, displayNumber }) {
  return function callback(dispatch) {
    dispatch(requestPluginAction());

    return PedalboardService.getPlugins(currentPage, displayNumber)
      .then((reponseData) => {
        dispatch(receivePluginAction(reponseData));
        return reponseData;
      })
      .catch((responseMessage) => {
        dispatch(cancelPluginRequestAction());
        throw responseMessage;
      });
  };
}

function findPluginsAction({ searchParams, currentPage, displayNumber }) {
  return function callback(dispatch) {
    dispatch(requestPluginAction());

    return PedalboardService.findPlugins(searchParams, currentPage, displayNumber)
      .then((reponseData) => {
        dispatch(receivePluginAction(reponseData));
        return reponseData;
      })
      .catch((responseMessage) => {
        dispatch(cancelPluginRequestAction());
        throw responseMessage;
      });
  };
}

export {
  fetchPluginsAction,
  findPluginsAction
};
