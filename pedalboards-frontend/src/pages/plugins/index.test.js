// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// Stub
import { MemoryRouter, Route } from 'react-router-dom';

// Redux - store
import store from 'redux/store';

// Components
import Plugins from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/plugins']}>
        <Route path="/plugins" component={Plugins} />
      </MemoryRouter>
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
