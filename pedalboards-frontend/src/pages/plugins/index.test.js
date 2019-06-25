// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Components
import Plugins from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Plugins />, div);
  ReactDOM.unmountComponentAtNode(div);
});
