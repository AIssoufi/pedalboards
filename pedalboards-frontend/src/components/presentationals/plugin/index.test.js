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
        _id='ghjklmljhjkjhj'
        author={{
          avatarUrl: 'http://example.com',
          name: "Lorem"
        }}
        brand='lorem'
        categories={['A', 'B', 'C']}
        controlPorts={[{
          default: 1,
          max: 2,
          min: 3,
          name: 'lorem'
        }]}
        description='lorem impsum'
        imageHeight={400}
        imageWidth={400}
        label='lorem'
        name='I Love U'
        pedalboardCount={42}
        screenshotUrl='http://example.com/screenshot'
        stable
        thumbnailUrl='http://example.com/thumbnail'
        uri='http://example.com'
      /></MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
