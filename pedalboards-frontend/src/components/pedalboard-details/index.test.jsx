// Dependencies
import { render, screen } from '@testing-library/react';

// Stub
import { MemoryRouter } from 'react-router';

// Components
import PedalboardDetails from './index';

const LOADER_TEXT = 'Je Fais ça En Deux Deux...';

/**
 * Renders the details of a plugin in a router.
 *
 * @param {Object} [props] - Props of the details.
 * @returns {HTMLElement} The element that holds the details.
 */
const renderDetails = props => render(
  <MemoryRouter><PedalboardDetails {...props} /></MemoryRouter>
).container;

it('renders without crashing', () => {
  renderDetails({
    author: { name: 'Lorem' },
    categories: ['A', 'B', 'C'],
    controlPorts: [{
      default: 1,
      max: 2,
      min: 3,
      name: 'lorem'
    }],
    description: 'lorem impsum',
    label: 'lorem',
    pedalboardCount: 42,
    screenshotUrl: 'http://example.com/screenshot',
    uri: 'http://example.com'
  });

  expect(screen.getByRole('heading', { name: 'lorem' })).toBeDefined();
});

it('displays a description holding markup as literal text', () => {
  renderDetails({
    author: { name: 'Lorem' },
    categories: ['A'],
    controlPorts: [],
    description: '<b>x</b>',
    label: 'lorem',
    pedalboardCount: 42,
    screenshotUrl: 'http://example.com/screenshot',
    uri: 'http://example.com'
  });

  const description = screen.getByText('<b>x</b>');
  expect(description.className).toBe('pedalboard-description');
  expect(description.querySelector('b')).toBeNull();
});

it('renders without props', () => {
  const container = renderDetails();

  expect(screen.queryByRole('img')).toBeNull();
  expect(container.querySelector('.author a')).toBeNull();
  expect(container.querySelector('.plugin-version')).toBeNull();
  expect(screen.queryByRole('heading')).toBeNull();
  expect(container.querySelectorAll('.plugin-category, tbody tr')).toHaveLength(0);
  expect(container.textContent).not.toContain('undefined');
});

it.each([
  ['null', null],
  ['not arrays', 'Delay']
])('renders when the author, categories and control ports are %s', (description, value) => {
  const container = renderDetails({ author: value, categories: value, controlPorts: value });

  expect(container.querySelectorAll('.plugin-category, tbody tr')).toHaveLength(0);
  expect(container.textContent).not.toContain('undefined');
});

it('skips the categories and control ports that cannot be shown', () => {
  const container = renderDetails({
    categories: ['', null, '  ', 'Delay'],
    controlPorts: [
      null,
      'Gain',
      { name: 'Gain', default: 1 },
      {},
      { name: { en: 'Level' }, default: NaN, min: 0, max: 10 }
    ]
  });

  const categoryLinks = [...container.querySelectorAll('.plugin-category')];
  const rows = [...container.querySelectorAll('tbody tr')]
    .map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent));
  expect(categoryLinks.map(link => link.textContent)).toEqual(['Delay']);
  expect(rows).toEqual([['Gain', '1', '', ''], ['', '', '', ''], ['', '', '0', '10']]);
});

it('encodes the categories of the filter links', () => {
  const container = renderDetails({ categories: ['A&B', 'C++'] });

  const hrefs = [...container.querySelectorAll('.plugin-category')]
    .map(link => link.getAttribute('href'));
  expect(hrefs).toEqual(['/plugins?categories=A%26B', '/plugins?categories=C%2B%2B']);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('shows the loader in place of the details while loading', () => {
  renderDetails({ label: 'Gx Overdrive', isLoading: true });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  expect(screen.queryByText('Gx Overdrive')).toBeNull();
});

it('shows the loader for a truthy isLoading that is not a boolean', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  renderDetails({ isLoading: 'yes' });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
});

it.each([
  ['missing', undefined],
  ['null', null],
  ['zero', 0],
  ['empty', '']
])('shows the details when isLoading is %s', (description, isLoading) => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  renderDetails({ label: 'Gx Overdrive', isLoading });

  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(screen.getByText('Gx Overdrive')).toBeDefined();
});
