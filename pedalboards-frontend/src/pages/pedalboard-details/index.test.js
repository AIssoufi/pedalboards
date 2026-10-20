// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Stub
import { MemoryRouter, Route } from 'react-router-dom';

// Components
import PedalboardDetails from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/plugin/2']}>
      <Route path="/plugin/:id" component={PedalboardDetails} />
    </MemoryRouter>, div
  );
  ReactDOM.unmountComponentAtNode(div);
});
