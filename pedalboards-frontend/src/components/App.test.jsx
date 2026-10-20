import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '../redux/store';
import App from './App';

it('renders without crashing', () => {
  // The store fetches the plugins: an answer keeps its promise from failing after the test
  const emptyAnswer = { data: [], count: 0, numberPages: 0 };
  vi.spyOn(window, 'fetch')
    .mockImplementation(() => Promise.resolve({ json: () => emptyAnswer }));
  const div = document.createElement('div');
  try {
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  } finally {
    window.fetch.mockRestore();
  }
});
