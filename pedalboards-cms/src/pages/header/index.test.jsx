// Dependencies
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Utils
import { render } from 'utils/testing';

// Components
import Header from './index';

describe('Header', () => {
  let view;

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
  });

  it('leaves its texts in the language of the page', () => {
    view = render(<MemoryRouter><Header /></MemoryRouter>);

    expect(view.container.querySelector('[lang]')).toBeNull();
  });

  it('shows the sign-out button', () => {
    view = render(<MemoryRouter><Header /></MemoryRouter>);

    expect(view.container.querySelector('button').textContent).toBe('Sign out');
  });

  it('links to the list of plugins and to the form that adds one', () => {
    view = render(<MemoryRouter><Header /></MemoryRouter>);

    const linkTexts = [...view.container.querySelectorAll('nav a')].map(link => link.textContent);

    expect(linkTexts).toEqual(['My plugins', 'Add plugin']);
  });
});
