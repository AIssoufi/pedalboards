// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Components
import Pagination from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Pagination
    currentPage={6}
    elementCount={54}
    onCurrentPageChange={() => { }}
  />, div);
  ReactDOM.unmountComponentAtNode(div);
});
