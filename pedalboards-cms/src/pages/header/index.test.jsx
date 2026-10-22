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

  it('marks its English links inside the French page', () => {
    view = render(<MemoryRouter><Header /></MemoryRouter>);

    const { container } = view;

    expect(container.querySelector('nav').lang).toBe('en');
    expect(container.querySelector('button').closest('[lang]')).toBeNull();
  });

  it('links to the list of plugins and to the form that adds one', () => {
    view = render(<MemoryRouter><Header /></MemoryRouter>);

    const linkTexts = [...view.container.querySelectorAll('nav a')].map(link => link.textContent);

    expect(linkTexts).toEqual(['My plugins', 'Add plugin']);
  });

  it('marks the English text alternative of the avatar inside the French page', () => {
    view = render(<MemoryRouter><Header /></MemoryRouter>);

    expect(view.container.querySelector('img').closest('[lang]').lang).toBe('en');
  });
});
