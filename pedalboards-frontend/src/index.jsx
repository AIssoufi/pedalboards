// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Style
import './index.scss';

// Components
import App from 'components/App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

serviceWorker.unregister();
