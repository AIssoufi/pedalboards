// Dependencies
import { combineReducers } from 'redux';

// Reducers
import pluginReducer from './plugin.reducer';

const rootReducer = combineReducers({
  plugin: pluginReducer
});

export default rootReducer;
