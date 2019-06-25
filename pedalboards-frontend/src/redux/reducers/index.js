// Dependencies
import { combineReducers } from 'redux';

// Reducers
import pluginReducer from 'redux/reducers/plugin.reducer';

const rootReducer = combineReducers({
  plugin: pluginReducer
});

export default rootReducer;
