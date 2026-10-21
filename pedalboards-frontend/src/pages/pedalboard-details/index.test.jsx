// Dependencies
import { render, screen } from '@testing-library/react';

// Stub
import { MemoryRouter, Route } from 'react-router-dom';

// Components
import PedalboardDetails from './index';

it('renders without crashing', async () => {
  // The page fetches the plugin: an answer keeps its promise from failing after the test
  vi.spyOn(window, 'fetch')
    .mockImplementation(() => Promise.resolve({ json: () => ({}) }));
  try {
    render(
      <MemoryRouter initialEntries={['/plugin/2']}>
        <Route path="/plugin/:id" component={PedalboardDetails} />
      </MemoryRouter>
    );

    // An answer without a plugin leaves the page with its empty state
    expect(await screen.findByText('Pas de données disponible')).toBeDefined();
  } finally {
    window.fetch.mockRestore();
  }
});
