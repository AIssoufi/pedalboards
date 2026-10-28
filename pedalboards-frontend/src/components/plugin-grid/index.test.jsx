// Dependencies
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Components
import PluginGrid from './index';

const EMPTY_STATE_TEXT = 'No plugin matches your search!';
const LOADER_TEXT = 'Loading...';
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

it('loads the screenshots of the first row at once, the others once they near the viewport', () => {
  const plugins = Array.from({ length: 7 }, (value, index) => ({
    _id: `plugin-${index}`, screenshotUrl: `http://example.com/screenshot-${index}`
  }));
  renderGrid({ plugins });

  const loadings = screen.getAllByRole('img').map(screenshot => screenshot.getAttribute('loading'));
  expect(loadings).toEqual([null, null, null, null, null, 'lazy', 'lazy']);
});

it('shows the loader in place of the cards while loading', () => {
  renderGrid({ plugins: PLUGINS, isLoading: true });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  expect(screen.queryAllByRole('link')).toHaveLength(0);
});

it('shows the loader for a truthy isLoading that is not a boolean', () => {
  renderGrid({ plugins: PLUGINS, isLoading: 'yes' });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
});

it.each([
  ['missing', undefined],
  ['null', null],
  ['zero', 0],
  ['empty', '']
])('shows the cards when isLoading is %s', (description, isLoading) => {
  renderGrid({ plugins: PLUGINS, isLoading });

  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
});
