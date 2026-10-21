import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../redux/store';
import App from './App';

it('renders without crashing', async () => {
  // The store fetches the plugins: an answer keeps its promise from failing after the test
  const emptyAnswer = { data: [], count: 0, numberPages: 0 };
  vi.spyOn(window, 'fetch')
    .mockImplementation(() => Promise.resolve({ json: () => emptyAnswer }));
  try {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByRole('link', { name: 'Plugins' })).toBeDefined();
    // The grid shows its empty state once the answer is in the store
    expect(await screen.findByText('Aucun plugin ne correspond à votre recherche !')).toBeDefined();
  } finally {
    window.fetch.mockRestore();
  }
});
