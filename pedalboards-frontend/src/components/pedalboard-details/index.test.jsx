// Dependencies
import { render, screen } from '@testing-library/react';

// Stub
import { MemoryRouter } from 'react-router';

// Components
import PedalboardDetails from './index';

const LOADER_TEXT = 'Loading...';
const URI_LABEL = 'Plugin identifier:';

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
  expect(screen.getByRole('img', { name: 'Screenshot of lorem' })).toBeDefined();
});

it('titles the page with the label of the plugin', () => {
  renderDetails({ label: 'abGate' });

  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('abGate');
});

it('leaves out the title of a label made only of spaces, which names nothing', () => {
  renderDetails({ label: '   ' });

  expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
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
  expect(container.querySelector('.plugin-uri')).toBeNull();
  expect(container.querySelector('.plugin-version')).toBeNull();
  expect(screen.queryByRole('heading')).toBeNull();
  expect(container.querySelectorAll('.plugin-category, tbody tr')).toHaveLength(0);
  expect(container.textContent).not.toContain('undefined');
});

it.each([
  ['an HTTP identifier', 'http://moddevices.com/plugins/mda/Overdrive'],
  ['a URN', 'urn:maxgen:WOV_gendsp']
])('shows %s once, labelled, as plain text', (description, uri) => {
  const container = renderDetails({ uri });

  expect(container.querySelector('.plugin-uri').textContent).toBe(`${URI_LABEL} ${uri}`);
  expect(container.textContent.split(uri)).toHaveLength(2);
  expect(container.querySelector('a[target="_blank"]')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
});

it.each([
  ['missing', undefined],
  ['null', null],
  ['empty', ''],
  ['made only of spaces', '   '],
  ['a number', 42],
  ['an object', { en: 'urn:maxgen:WOV_gendsp' }]
])('shows no identifier and no label when the URI is %s', (description, uri) => {
  const container = renderDetails({ uri, version: '1.0' });

  expect(container.querySelector('.plugin-uri')).toBeNull();
  expect(container.textContent).not.toContain(URI_LABEL);
  expect(container.querySelector('.plugin-version').textContent).toBe('v1.0');
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

it.each([
  ['some control ports', [{ name: 'Gain', default: 1, min: 0, max: 10 }]],
  ['no control ports', []],
  ['control ports that are missing', null],
  ['control ports that are not a list', 'Delay'],
  ['bad control-port entries', [null, 'Gain']]
])('lets the keyboard reach the scrolling table with %s', (description, controlPorts) => {
  renderDetails({ controlPorts });

  const region = screen.getByRole('region', { name: 'Control ports' });
  expect(region.tabIndex).toBe(0);
  expect(region.querySelector('table')).not.toBeNull();
});

it('encodes the categories of the filter links', () => {
  const container = renderDetails({ categories: ['A&B', 'C++'] });

  const hrefs = [...container.querySelectorAll('.plugin-category')]
    .map(link => link.getAttribute('href'));
  expect(hrefs).toEqual(['/plugins?categories=A%26B', '/plugins?categories=C%2B%2B']);
});

it('shows the loader in place of the details while loading', () => {
  renderDetails({ label: 'Gx Overdrive', isLoading: true });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  expect(screen.queryByText('Gx Overdrive')).toBeNull();
});

it('shows the loader for a truthy isLoading that is not a boolean', () => {
  renderDetails({ isLoading: 'yes' });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
});

it.each([
  ['missing', undefined],
  ['null', null],
  ['zero', 0],
  ['empty', '']
])('shows the details when isLoading is %s', (description, isLoading) => {
  renderDetails({ label: 'Gx Overdrive', isLoading });

  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(screen.getByText('Gx Overdrive')).toBeDefined();
});

it.each([1, 42])('shows a pedalboard count of %s as text, not a link', pedalboardCount => {
  const container = renderDetails({ pedalboardCount });

  const count = container.querySelector('.count');
  expect(count.tagName).toBe('SPAN');
  expect(count.textContent).toBe(String(pedalboardCount));
  expect(container.querySelector('.count-container a')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
});

it.each([
  ['0', 0],
  ['missing', undefined],
  ['null', null],
  ['NaN', NaN],
  ['negative', -1],
  ['a text', 'abc']
])('shows no pedalboard count when it is %s', (description, pedalboardCount) => {
  const container = renderDetails({ pedalboardCount });

  expect(container.querySelector('.count-container')).toBeNull();
  expect(screen.queryByText('Pedalboards using it')).toBeNull();
});

it('reserves the box of the screenshot from its size', () => {
  renderDetails({
    label: 'abGate', screenshotUrl: 'http://example.com/screenshot', imageWidth: 261, imageHeight: 430
  });

  const screenshot = screen.getByRole('img', { name: 'Screenshot of abGate' });
  expect(screenshot.getAttribute('width')).toBe('261');
  expect(screenshot.getAttribute('height')).toBe('430');
  expect(screenshot.style.getPropertyValue('--screenshot-height')).toBe('430px');
});

it.each([
  ['missing', undefined, undefined],
  ['null, as the API sends it for a plugin without a size', null, null],
  ['zero', 0, 0],
  ['negative', -261, -430],
  ['texts', '261', '430'],
  ['not a number', NaN, NaN]
])('lets the screenshot take its own size when its size is %s', (description, imageWidth, imageHeight) => {
  renderDetails({
    label: 'abGate', screenshotUrl: 'http://example.com/screenshot', imageWidth, imageHeight
  });

  const screenshot = screen.getByRole('img', { name: 'Screenshot of abGate' });
  expect(screenshot.hasAttribute('width')).toBe(false);
  expect(screenshot.hasAttribute('height')).toBe(false);
  expect(screenshot.hasAttribute('style')).toBe(false);
});

it('leaves the height to the screenshot when only its width is known', () => {
  renderDetails({ label: 'abGate', screenshotUrl: 'http://example.com/screenshot', imageWidth: 261 });

  const screenshot = screen.getByRole('img', { name: 'Screenshot of abGate' });
  expect(screenshot.getAttribute('width')).toBe('261');
  expect(screenshot.hasAttribute('height')).toBe(false);
  expect(screenshot.hasAttribute('style')).toBe(false);
});
