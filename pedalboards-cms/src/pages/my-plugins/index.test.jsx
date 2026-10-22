// Dependencies
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

// Services
import { PedalboardService } from 'services';

// Utils
import { flushPromises, render } from 'utils/testing';

// Components
import MyPlugins from './index';

const ALL_PLUGINS = {
  data: [{ _id: 'gate', name: 'Gate' }, { _id: 'reverb', name: 'Reverb' }],
  count: 2,
  currentPage: 1,
  numberPages: 1
};

const FOUND_PLUGINS = {
  data: [{ _id: 'gate', name: 'Gate' }],
  count: 1,
  currentPage: 1,
  numberPages: 1
};

const EMPTY_STATE_TEXT = 'Vous n\'avez ajouté aucun plugin';

const renderMyPlugins = props => render(
  <MemoryRouter>
    <MyPlugins {...props} />
  </MemoryRouter>
);

const readTitles = container => Array.from(
  container.querySelectorAll('.plugin .title'),
  title => title.textContent
);

const readErrorText = (container) => {
  const error = container.querySelector('[role="alert"]');

  return error && error.textContent;
};

const isPropTypeWarning =([message]) => String(message).includes('Failed prop type');

const readPropTypeWarnings = () => console.error.mock.calls.filter(isPropTypeWarning);

describe('MyPlugins', () => {
  let view;

  beforeEach(() => {
    jest.spyOn(console, 'error');
    jest.spyOn(PedalboardService, 'getPlugins').mockResolvedValue(ALL_PLUGINS);
    jest.spyOn(PedalboardService, 'findPlugins').mockResolvedValue(FOUND_PLUGINS);
  });

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
    jest.restoreAllMocks();
  });

  it('lists the plugins that match the search of the address', async () => {
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();

    const [[searchParams, page]] = PedalboardService.findPlugins.mock.calls;

    expect(searchParams.get('name')).toBe('gate');
    expect(page).toBe(1);
    expect(PedalboardService.getPlugins).not.toHaveBeenCalled();
    expect(readTitles(view.container)).toEqual(['Gate']);
  });

  it('lists every plugin without a search', async () => {
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();

    expect(PedalboardService.findPlugins).not.toHaveBeenCalled();
    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });

  it('lists every plugin when the search has no parameter', async () => {
    view = renderMyPlugins({ location: { search: '?' } });
    await flushPromises();

    expect(PedalboardService.findPlugins).not.toHaveBeenCalled();
    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });

  it('shows the empty state when no plugin matches the search', async () => {
    PedalboardService.findPlugins.mockResolvedValue({ data: [], count: 0, numberPages: 0 });
    view = renderMyPlugins({ location: { search: '?name=nothing' } });
    await flushPromises();

    expect(readTitles(view.container)).toEqual([]);
    expect(view.container.textContent).toContain(EMPTY_STATE_TEXT);
  });

  it('shows the empty state when the response has no data', async () => {
    PedalboardService.findPlugins.mockResolvedValue({});
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();

    expect(view.container.textContent).toContain(EMPTY_STATE_TEXT);
    expect(readPropTypeWarnings()).toEqual([]);
  });

  it('shows the message of a failed search', async () => {
    PedalboardService.findPlugins.mockRejectedValue(
      new Error('Le service des plugins ne répond pas')
    );
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();

    expect(readErrorText(view.container)).toBe('Le service des plugins ne répond pas');
    expect(view.container.textContent).toContain(EMPTY_STATE_TEXT);
  });

  it('keeps the list and shows the message of a failed delete', async () => {
    jest.spyOn(PedalboardService, 'deletePlugin').mockRejectedValue(new Error('Plugin non trouvé'));
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();
    act(() => {
      view.container.querySelector('.plugin button').click();
    });
    await flushPromises();

    expect(readErrorText(view.container)).toBe('Plugin non trouvé');
    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });

  it('shows no message once the plugins are loaded', async () => {
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();

    expect(readErrorText(view.container)).toBeNull();
  });

  it('lists every plugin without a location', async () => {
    view = renderMyPlugins();
    await flushPromises();

    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });
});
