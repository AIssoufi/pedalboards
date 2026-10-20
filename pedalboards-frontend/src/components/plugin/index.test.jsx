// Dependencies
import React from 'react';
import { render, screen } from '@testing-library/react';

// Stub
import { MemoryRouter } from 'react-router-dom';

// Components
import Plugin from './index';

/**
 * Renders the plugin card in a router.
 *
 * @param {Object} [props] - Props of the card.
 * @returns {HTMLElement} The element that holds the card.
 */
const renderPlugin = props => render(<MemoryRouter><Plugin {...props} /></MemoryRouter>).container;

it('renders without crashing', () => {
  renderPlugin({
    _id: 'ghjklmljhjkjhj',
    author: {
      avatarUrl: 'http://example.com',
      name: 'Lorem'
    },
    brand: 'lorem',
    categories: ['A', 'B', 'C'],
    controlPorts: [{
      default: 1,
      max: 2,
      min: 3,
      name: 'lorem'
    }],
    description: 'lorem impsum',
    imageHeight: 400,
    imageWidth: 400,
    label: 'lorem',
    name: 'I Love U',
    pedalboardCount: 42,
    screenshotUrl: 'http://example.com/screenshot',
    stable: true,
    thumbnailUrl: 'http://example.com/thumbnail',
    uri: 'http://example.com'
  });

  expect(screen.getByRole('img', { name: 'Plugin screenshot' })).toBeDefined();
});

it('renders without props', () => {
  const container = renderPlugin();

  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
  expect(container.querySelectorAll('.category, .info')).toHaveLength(0);
  expect(container.textContent).not.toContain('undefined');
});

it.each([
  ['missing', undefined],
  ['null', null],
  ['not an array', 'Delay'],
  ['holding blank or non-string values', ['', '  ', 42, null, 'Delay']]
])('shows only the usable categories when they are %s', (description, categories) => {
  const container = renderPlugin({ categories });

  const shownCategories = [...container.querySelectorAll('.category')]
    .map(link => link.textContent);
  expect(shownCategories).toEqual(Array.isArray(categories) ? ['Delay'] : []);
});

it('encodes the values of the filter links', () => {
  renderPlugin({ brand: 'A&B', categories: ['C++'], label: 'Gate Dynamics' });

  const hrefs = screen.getAllByRole('link').map(link => link.getAttribute('href'));
  expect(hrefs).toEqual([
    '/plugins?categories=C%2B%2B',
    '/plugins?label=Gate+Dynamics',
    '/plugins?brand=A%26B'
  ]);
});

describe('tooltips', () => {
  it('displays fields holding markup as literal text', () => {
    const markup = '<b>x</b>';
    const container = renderPlugin({
      _id: 'ghjklmljhjkjhj',
      author: { name: 'Lorem' },
      brand: markup,
      categories: [markup],
      label: markup,
      name: markup,
      screenshotUrl: 'http://example.com/screenshot'
    });
    const tooltipped = container.querySelectorAll('[data-tooltipped]');
    tooltipped.forEach(element => element.dispatchEvent(new MouseEvent('mouseenter')));
    const tooltips = document.querySelectorAll('.tippy-tooltip-content');
    expect(tooltipped).toHaveLength(4);
    expect(tooltips).toHaveLength(4);
    tooltips.forEach((tooltip) => {
      expect(tooltip.textContent).toContain(markup);
      expect(tooltip.innerHTML).not.toContain(markup);
    });
  });
});

it('shows the screenshot without a link to the details when the plugin has no id', () => {
  renderPlugin({ screenshotUrl: 'http://example.com/screenshot' });

  expect(screen.getByRole('img').getAttribute('src')).toBe('http://example.com/screenshot');
  expect(screen.queryByRole('link')).toBeNull();
});
