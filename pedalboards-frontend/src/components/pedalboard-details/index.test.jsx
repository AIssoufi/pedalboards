// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Stub
import { MemoryRouter } from 'react-router-dom';

// Components
import PedalboardDetails from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <PedalboardDetails
        author={{ name: 'Lorem' }}
        categories={['A', 'B', 'C']}
        controlPorts={[{
          default: 1,
          max: 2,
          min: 3,
          name: 'lorem'
        }]}
        description="lorem impsum"
        label="lorem"
        pedalboardCount={42}
        screenshotUrl="http://example.com/screenshot"
        uri="http://example.com"
      />
    </MemoryRouter>, div
  );
  ReactDOM.unmountComponentAtNode(div);
});

it('displays a description holding markup as literal text', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <PedalboardDetails
        author={{ name: 'Lorem' }}
        categories={['A']}
        controlPorts={[]}
        description="<b>x</b>"
        label="lorem"
        pedalboardCount={42}
        screenshotUrl="http://example.com/screenshot"
        uri="http://example.com"
      />
    </MemoryRouter>, div
  );
  const description = div.querySelector('.pedalboard-description');
  expect(description.textContent).toBe('<b>x</b>');
  expect(description.querySelector('b')).toBeNull();
  ReactDOM.unmountComponentAtNode(div);
});

it('renders without props', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><PedalboardDetails /></MemoryRouter>, div);

  expect(div.querySelector('img')).toBeNull();
  expect(div.querySelector('.author a')).toBeNull();
  expect(div.querySelector('.plugin-version')).toBeNull();
  expect(div.querySelector('h2')).toBeNull();
  expect(div.querySelectorAll('.plugin-category, tbody tr')).toHaveLength(0);
  expect(div.textContent).not.toContain('undefined');
  ReactDOM.unmountComponentAtNode(div);
});

it.each([
  ['null', null],
  ['not arrays', 'Delay']
])('renders when the author, categories and control ports are %s', (description, value) => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <PedalboardDetails author={value} categories={value} controlPorts={value} />
    </MemoryRouter>, div
  );

  expect(div.querySelectorAll('.plugin-category, tbody tr')).toHaveLength(0);
  expect(div.textContent).not.toContain('undefined');
  ReactDOM.unmountComponentAtNode(div);
});

it('skips the categories and control ports that cannot be shown', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <PedalboardDetails
        categories={['', null, '  ', 'Delay']}
        controlPorts={[
          null,
          'Gain',
          { name: 'Gain', default: 1 },
          {},
          { name: { en: 'Level' }, default: NaN, min: 0, max: 10 }
        ]}
      />
    </MemoryRouter>, div
  );

  const categoryLinks = [...div.querySelectorAll('.plugin-category')];
  const rows = [...div.querySelectorAll('tbody tr')]
    .map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent));
  expect(categoryLinks.map(link => link.textContent)).toEqual(['Delay']);
  expect(rows).toEqual([['Gain', '1', '', ''], ['', '', '', ''], ['', '', '0', '10']]);
  ReactDOM.unmountComponentAtNode(div);
});

it('encodes the categories of the filter links', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <PedalboardDetails categories={['A&B', 'C++']} />
    </MemoryRouter>, div
  );

  const hrefs = [...div.querySelectorAll('.plugin-category')]
    .map(link => link.getAttribute('href'));
  expect(hrefs).toEqual(['/plugins?categories=A%26B', '/plugins?categories=C%2B%2B']);
  ReactDOM.unmountComponentAtNode(div);
});
