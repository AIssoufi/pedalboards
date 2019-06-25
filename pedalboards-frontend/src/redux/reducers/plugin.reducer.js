import { PluginConstants } from 'redux/constants';

const initialPluginState = {
  data: [],
  elementCount: 0,
  countPlugins: -1,
  isFetching: false,
  lastUpdate: undefined
};

const pluginReducer = (state = initialPluginState, action) => {
  const {
    REQUEST_PLUGIN, RECEIVE_PLUGIN, CANCEL_PLUGIN_REQUEST
  } = PluginConstants;

  const {
    type, payload
  } = action;

  switch (type) {
  case REQUEST_PLUGIN:
    return {
      ...state,
      isFetching: true
    };
  case RECEIVE_PLUGIN: {
    const { data, count, numberPages } = payload;
    return {
      ...state,
      isFetching: false,
      data,
      elementCount: count,
      countPlugins: numberPages,
      lastUpdate: Date.now()
    };
  }
  case CANCEL_PLUGIN_REQUEST:
    return {
      ...state,
      isFetching: false
    };
  default:
    return state;
  }
};

export default pluginReducer;
