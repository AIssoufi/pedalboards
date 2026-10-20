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

it('encodes the values of the filter links', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <Plugin
        _id="ghjklmljhjkjhj"
        author={{ name: 'Lorem' }}
        brand="A&B"
        categories={['C++']}
        label="Gate Dynamics"
        name="Lorem"
        screenshotUrl="http://example.com/screenshot"
      />
    </MemoryRouter>, div
  );

  const hrefs = [...div.querySelectorAll('.category, .info')].map(link => link.getAttribute('href'));
  expect(hrefs).toEqual([
    '/plugins?categories=C%2B%2B',
    '/plugins?label=Gate+Dynamics',
    '/plugins?brand=A%26B'
  ]);
  ReactDOM.unmountComponentAtNode(div);
});
