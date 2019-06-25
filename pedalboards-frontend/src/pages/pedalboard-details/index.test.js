// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Stub
import { MemoryRouter } from 'react-router-dom';

// Components
import PedalboardDetails from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={["/plugins/2"]}>
      <PedalboardDetails />
    </MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
