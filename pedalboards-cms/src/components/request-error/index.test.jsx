// Dependencies
import React from 'react';

// Utils
import { render } from 'utils/testing';

// Components
import RequestError from './index';

describe('RequestError', () => {
  let view;

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
    jest.restoreAllMocks();
  });

  it('shows the message as an alert', () => {
    view = render(<RequestError message="Plugin non trouvé" />);

    const alert = view.container.querySelector('[role="alert"]');

    expect(alert.textContent).toBe('Plugin non trouvé');
    expect(alert.className).toBe('request-error');
  });

  it('renders nothing without any props', () => {
    view = render(<RequestError />);

    expect(view.container.innerHTML).toBe('');
  });

  it('renders nothing for an empty message', () => {
    view = render(<RequestError message="" />);

    expect(view.container.innerHTML).toBe('');
  });

  it('renders nothing for a message that is not a text', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    view = render(<RequestError message={404} />);

    expect(view.container.innerHTML).toBe('');
  });
});
