// Dependencies
import { render, screen } from '@testing-library/react';

// Stub
import { MemoryRouter, Route } from 'react-router-dom';

// Components
import PedalboardDetails from './index';

const LOADER_TEXT = 'Je Fais ça En Deux Deux...';
const EMPTY_STATE_TEXT = 'Pas de données disponible';

/**
 * Answers each fetch with the plugin that `getPlugin` gives for its URL.
 *
 * @param {Function} getPlugin - Gives the plugin of a URL, or `undefined` for no plugin.
 */
const mockFetch = getPlugin => vi.spyOn(window, 'fetch')
  .mockImplementation(url => Promise.resolve({ json: () => ({ data: getPlugin(String(url)) }) }));

afterEach(() => {
  vi.restoreAllMocks();
});

it('renders without crashing', async () => {
  // The page fetches the plugin: an answer keeps its promise from failing after the test
  mockFetch(() => undefined);
  render(
    <MemoryRouter initialEntries={['/plugin/2']}>
      <Route path="/plugin/:id" component={PedalboardDetails} />
    </MemoryRouter>
  );

  // An answer without a plugin leaves the page with its empty state
  expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
});

it('shows the loader, then the plugin of the id of its route', async () => {
  mockFetch(url => (url.endsWith('/plugin/2') ? { uri: 'https://plugin/2' } : undefined));
  render(
    <MemoryRouter initialEntries={['/plugin/2']}>
      <Route path="/plugin/:id" component={PedalboardDetails} />
    </MemoryRouter>
  );

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  expect(await screen.findByRole('link', { name: 'https://plugin/2' })).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
});

it('fetches the plugin of a new id and shows the loader until it answers', async () => {
  mockFetch(url => ({ uri: `https://plugin/${url.split('/').pop()}` }));
  const { rerender } = render(<PedalboardDetails match={{ params: { id: '2' } }} />);
  expect(await screen.findByRole('link', { name: 'https://plugin/2' })).toBeDefined();

  rerender(<PedalboardDetails match={{ params: { id: '3' } }} />);

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  expect(await screen.findByRole('link', { name: 'https://plugin/3' })).toBeDefined();
  expect(window.fetch).toHaveBeenCalledTimes(2);
});

it('shows the empty state when the fetch fails', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(window, 'fetch').mockImplementation(() => Promise.reject(new Error('offline')));
  render(<PedalboardDetails match={{ params: { id: '2' } }} />);

  expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
});

it.each([
  ['no match', undefined],
  ['a match without params', {}]
])('renders its empty state with %s, without fetching', async (description, match) => {
  mockFetch(() => undefined);

  render(<PedalboardDetails match={match} />);

  expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
  expect(window.fetch).not.toHaveBeenCalled();
});

it('ignores the late answer of a previous id', async () => {
  // Resolves the fetch of each id, held until the test answers it
  const answerById = {};
  vi.spyOn(window, 'fetch').mockImplementation(url => new Promise((resolve) => {
    const id = String(url).split('/').pop();
    answerById[id] = () => resolve({ json: () => ({ data: { uri: `https://plugin/${id}` } }) });
  }));
  const { rerender } = render(<PedalboardDetails match={{ params: { id: '2' } }} />);
  rerender(<PedalboardDetails match={{ params: { id: '3' } }} />);

  answerById['3']();
  expect(await screen.findByRole('link', { name: 'https://plugin/3' })).toBeDefined();
  answerById['2']();

  // The answer for id 2 settles, then leaves the plugin of id 3 on the page
  await new Promise((resolve) => { setTimeout(resolve); });
  expect(screen.getByRole('link', { name: 'https://plugin/3' })).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
});

it('shows its empty state when the route loses its id', async () => {
  mockFetch(url => ({ uri: `https://plugin/${url.split('/').pop()}` }));
  const { rerender } = render(<PedalboardDetails match={{ params: { id: '2' } }} />);
  expect(await screen.findByRole('link', { name: 'https://plugin/2' })).toBeDefined();

  rerender(<PedalboardDetails match={undefined} />);

  expect(screen.getByText(EMPTY_STATE_TEXT)).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(window.fetch).toHaveBeenCalledTimes(1);
});
