// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Stub
import { MemoryRouter, Route } from 'react-router-dom';

// Components
import PedalboardDetails from './index';

it('renders without crashing', () => {
  // The page fetches the plugin: an answer keeps its promise from failing after the test
  vi.spyOn(window, 'fetch')
    .mockImplementation(() => Promise.resolve({ json: () => ({}) }));
  const div = document.createElement('div');
  try {
    ReactDOM.render(
      <MemoryRouter initialEntries={['/plugin/2']}>
        <Route path="/plugin/:id" component={PedalboardDetails} />
      </MemoryRouter>, div
    );
    ReactDOM.unmountComponentAtNode(div);
  } finally {
    window.fetch.mockRestore();
  }
});
