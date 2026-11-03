// Dependencies
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Utils
import { render } from 'utils/testing';

// Components
import PluginItem from './index';

const STORE_URL = 'https://store.example';

/**
 * Renders a row inside a router, which its edit link needs.
 * @param {Object} [props] props of the row
 * @returns {Object} the rendered view
 */
const renderItem = props => render(
  <MemoryRouter>
    <PluginItem {...props} />
  </MemoryRouter>
);

const readActionLabels = container => Array.from(container.querySelectorAll('.controls > *'))
  .map(action => action.getAttribute('aria-label'));

describe('PluginItem', () => {
  let view;

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
    jest.restoreAllMocks();
  });

  it('shows the name of the plugin with its three actions', () => {
    view = renderItem({ id: 'gate', name: 'Gate', homePageUrl: STORE_URL });

    expect(view.container.querySelector('.plugin .title').textContent).toBe('Gate');
    expect(readActionLabels(view.container))
      .toEqual(['View Gate (new tab)', 'Edit Gate', 'Delete Gate']);
  });

  it('links to the page of the plugin in the store, in a new tab, and to its edit page', () => {
    view = renderItem({ id: 'gate', name: 'Gate', homePageUrl: STORE_URL });

    const [viewLink, editLink] = view.container.querySelectorAll('.controls a');

    expect(viewLink.getAttribute('href')).toBe('https://store.example/plugin/gate');
    expect(viewLink.getAttribute('target')).toBe('_blank');
    expect(viewLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(editLink.getAttribute('href')).toBe('/plugin/edit/gate');
  });

  it('gives its identifier to onDelete when the delete button is clicked', () => {
    const onDelete = jest.fn();
    view = renderItem({ id: 'gate', name: 'Gate', onDelete });

    view.container.querySelector('.controls button').click();

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('gate');
  });

  it('renders without any props, with a delete button that names no plugin and no link', () => {
    view = renderItem();

    expect(view.container.querySelector('.plugin .title').textContent).toBe('');
    expect(readActionLabels(view.container)).toEqual(['Delete']);
    expect(() => view.container.querySelector('.controls button').click()).not.toThrow();
  });

  it.each([
    ['an empty identifier', ''],
    ['an identifier of spaces', '  ']
  ])('shows no link for %s', (label, id) => {
    view = renderItem({ id, name: 'Gate', homePageUrl: STORE_URL });

    expect(view.container.querySelectorAll('.controls a')).toHaveLength(0);
    expect(readActionLabels(view.container)).toEqual(['Delete Gate']);
  });

  it.each([
    ['a missing store address', undefined],
    ['an empty store address', ''],
    ['a store address of spaces', '  ']
  ])('keeps only the edit link for %s', (label, homePageUrl) => {
    view = renderItem({ id: 'gate', name: 'Gate', homePageUrl });

    expect(readActionLabels(view.container)).toEqual(['Edit Gate', 'Delete Gate']);
  });

  it('does nothing on a click of delete when onDelete is not a function', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    view = renderItem({ id: 'gate', name: 'Gate', onDelete: 'delete' });

    expect(() => view.container.querySelector('.controls button').click()).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Failed prop type'));
  });
});
