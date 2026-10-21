// Dependencies
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Components
import PluginGrid from './index';

const EMPTY_STATE_TEXT = 'Aucun plugin ne correspond à votre recherche !';
const LOADER_TEXT = 'Je Fais ça En Deux Deux...';
const PLUGINS = [
  { _id: 'abgate', name: 'abGate', brand: 'abGate' },
  { _id: 'auto-wah', name: 'Wah', brand: 'MDA' }
];

/**
 * Renders the grid in a router, which the links of its cards need.
 *
 * @param {object} props - Props of the grid.
 */
const renderGrid = props => render(<MemoryRouter><PluginGrid {...props} /></MemoryRouter>);

afterEach(() => {
  vi.restoreAllMocks();
});

it('renders its empty state without props', () => {
  renderGrid();

  expect(screen.getByText(EMPTY_STATE_TEXT)).toBeDefined();
});

it('renders its empty state with an empty list', () => {
  renderGrid({ plugins: [] });

  expect(screen.getByText(EMPTY_STATE_TEXT)).toBeDefined();
});

it.each([
  ['null', null],
  ['an object', {}],
  ['a string', 'abc']
])('renders its empty state when the plugins are %s', (description, plugins) => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  renderGrid({ plugins });

  expect(screen.getByText(EMPTY_STATE_TEXT)).toBeDefined();
});

it('renders a card linking to the details of each plugin', () => {
  renderGrid({ plugins: PLUGINS });

  const hrefs = screen.getAllByRole('link')
    .map(link => link.getAttribute('href'))
    .filter(href => href.startsWith('/plugin/'));
  expect(hrefs).toEqual(['/plugin/abgate', '/plugin/auto-wah']);
  expect(screen.queryByText(EMPTY_STATE_TEXT)).toBeNull();
});

it('shows the loader in place of the cards while loading', () => {
  renderGrid({ plugins: PLUGINS, isLoading: true });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  expect(screen.queryAllByRole('link')).toHaveLength(0);
});
