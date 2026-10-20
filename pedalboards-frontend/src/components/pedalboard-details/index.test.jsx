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
