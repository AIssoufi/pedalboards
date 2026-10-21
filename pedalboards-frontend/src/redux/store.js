// Dependencies
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

// Reducers
import rootReducer from './reducers';

const { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: DEVTOOLS } = window;
const composeEnhancers = DEVTOOLS || compose;

const middlewares = [thunkMiddleware];

// Logs each action in development only: the production build drops this branch, and with it the
// whole redux-logger package, so that visitors never see the state in their console
if (import.meta.env.DEV) {
  const { default: logger } = await import('redux-logger');
  middlewares.push(logger);
}

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middlewares))
);

export default store;
