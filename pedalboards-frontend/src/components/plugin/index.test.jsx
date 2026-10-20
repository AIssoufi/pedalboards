// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Stub
import { MemoryRouter } from 'react-router-dom';

// Components
import Plugin from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <Plugin
        _id="ghjklmljhjkjhj"
        author={{
          avatarUrl: 'http://example.com',
          name: 'Lorem'
        }}
        brand="lorem"
        categories={['A', 'B', 'C']}
        controlPorts={[{
          default: 1,
          max: 2,
          min: 3,
          name: 'lorem'
        }]}
        description="lorem impsum"
        imageHeight={400}
        imageWidth={400}
        label="lorem"
        name="I Love U"
        pedalboardCount={42}
        screenshotUrl="http://example.com/screenshot"
        stable
        thumbnailUrl="http://example.com/thumbnail"
        uri="http://example.com"
      />

    </MemoryRouter>, div
  );
  ReactDOM.unmountComponentAtNode(div);
});

it('renders without props', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><Plugin /></MemoryRouter>, div);

  expect(div.querySelector('img')).toBeNull();
  expect(div.querySelector('a')).toBeNull();
  expect(div.querySelectorAll('.category, .info')).toHaveLength(0);
  expect(div.textContent).not.toContain('undefined');
  ReactDOM.unmountComponentAtNode(div);
});

it.each([
  ['missing', undefined],
  ['null', null],
  ['not an array', 'Delay'],
  ['holding blank or non-string values', ['', '  ', 42, null, 'Delay']]
])('shows only the usable categories when they are %s', (description, categories) => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><Plugin categories={categories} /></MemoryRouter>, div);

  const shownCategories = [...div.querySelectorAll('.category')].map(link => link.textContent);
  expect(shownCategories).toEqual(Array.isArray(categories) ? ['Delay'] : []);
  ReactDOM.unmountComponentAtNode(div);
});

it('encodes the values of the filter links', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <Plugin brand="A&B" categories={['C++']} label="Gate Dynamics" />
    </MemoryRouter>, div
  );

  const hrefs = [...div.querySelectorAll('.category, .info')]
    .map(link => link.getAttribute('href'));
  expect(hrefs).toEqual([
    '/plugins?categories=C%2B%2B',
    '/plugins?label=Gate+Dynamics',
    '/plugins?brand=A%26B'
  ]);
  ReactDOM.unmountComponentAtNode(div);
});

// popper.js positions the tooltips with document.createRange, which jsdom 11 lacks
const createRangeStub = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: document.body
});

describe('tooltips', () => {
  const originalCreateRange = document.createRange;
  let div;

  beforeEach(() => {
    document.createRange = createRangeStub;
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
    document.createRange = originalCreateRange;
  });

  it('displays fields holding markup as literal text', () => {
    const markup = '<b>x</b>';
    ReactDOM.render(
      <MemoryRouter>
        <Plugin
          _id="ghjklmljhjkjhj"
          author={{ name: 'Lorem' }}
          brand={markup}
          categories={[markup]}
          label={markup}
          name={markup}
          screenshotUrl="http://example.com/screenshot"
        />
      </MemoryRouter>, div
    );
    const tooltipped = div.querySelectorAll('[data-tooltipped]');
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
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter><Plugin screenshotUrl="http://example.com/screenshot" /></MemoryRouter>,
    div
  );

  expect(div.querySelector('img').getAttribute('src')).toBe('http://example.com/screenshot');
  expect(div.querySelector('a')).toBeNull();
  ReactDOM.unmountComponentAtNode(div);
});
