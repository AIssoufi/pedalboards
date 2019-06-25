// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Components
import Search from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Search
    onSubmit={() => { }}
  />, div);
  ReactDOM.unmountComponentAtNode(div);
});
