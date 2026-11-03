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

  it('titles the plugin by its label, with its name below, and names its actions by it', () => {
    view = renderItem({
      id: 'ambience', label: 'Ambience', name: 'MDA Ambience', homePageUrl: STORE_URL
    });

    expect(view.container.querySelector('.plugin .title').textContent).toBe('Ambience');
    expect(view.container.querySelector('.plugin .name').textContent).toBe('MDA Ambience');
    expect(readActionLabels(view.container))
      .toEqual(['View Ambience (new tab)', 'Edit Ambience', 'Delete Ambience']);
  });

  it('shows no second line when the name repeats the label', () => {
    view = renderItem({ id: 'gate', label: 'Gate', name: ' Gate ' });

    expect(view.container.querySelector('.plugin .title').textContent).toBe('Gate');
    expect(view.container.querySelector('.plugin .name')).toBeNull();
  });

  it('falls back to the name as the title when the label is blank', () => {
    view = renderItem({ id: 'gate', label: '   ', name: 'Gate', homePageUrl: STORE_URL });

    expect(view.container.querySelector('.plugin .title').textContent).toBe('Gate');
    expect(view.container.querySelector('.plugin .name')).toBeNull();
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

  it('renders without any props, as an untitled plugin with a delete button and no link', () => {
    view = renderItem();

    expect(view.container.querySelector('.plugin .title').textContent).toBe('Untitled plugin');
    expect(view.container.querySelector('.plugin .name')).toBeNull();
    expect(readActionLabels(view.container)).toEqual(['Delete Untitled plugin']);
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
