// Dependencies
import { createStore, applyMiddleware, compose } from 'redux';
import logger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

// Reducers
import rootReducer from './reducers';

const { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: DEVTOOLS } = window;
const composeEnhancers = DEVTOOLS || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
      logger
    )
  )
);

export default store;
