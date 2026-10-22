// Dependencies
import React from 'react';

// Services
import { PedalboardService } from 'services';

// Utils
import { flushPromises, render, submitForm } from 'utils/testing';

// Components
import EditPlugin from './index';

const GATE = {
  _id: 'gate',
  name: 'Gate',
  label: 'Noise gate',
  uri: 'https://example.com/gate',
  version: '1.0.0',
  brand: 'MDA',
  categories: ['Dynamics'],
  description: 'Cuts the noise',
  controlPorts: []
};

const REVERB = { _id: 'reverb', name: 'Reverb' };

const ROUTE_MATCH ={ params: { id: 'gate' } };

const readField = ({ container, name }) => container.querySelector(`[name="${name}"]`);

describe('EditPlugin', () => {
  let view;

  beforeEach(() => {
    jest.spyOn(PedalboardService, 'getPlugin').mockResolvedValue({ data: GATE });
    jest.spyOn(PedalboardService, 'updatePlugin').mockResolvedValue({ data: GATE });
  });

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
    jest.restoreAllMocks();
  });

  it('fills the edit form with the plugin of the route', async () => {
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    await flushPromises();

    const { container } = view;

    expect(PedalboardService.getPlugin).toHaveBeenCalledWith('gate');
    expect(container.querySelector('h1').textContent).toBe('Modifier le plugin');
    expect(readField({ container, name: 'name' }).value).toBe('Gate');
    expect(readField({ container, name: 'description' }).value).toBe('Cuts the noise');
  });

  it('saves the plugin under the id of the route', async () => {
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    await flushPromises();
    submitForm(view.container.querySelector('form'));
    await flushPromises();

    const [[id, formData]] = PedalboardService.updatePlugin.mock.calls;

    expect(id).toBe('gate');
    expect(formData.get('label')).toBe('Noise gate');
  });

  it('leaves empty the fields that the plugin does not have', async () => {
    PedalboardService.getPlugin.mockResolvedValue({ data: { _id: 'gate', name: 'Gate' } });
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    await flushPromises();

    const { container } = view;

    expect(readField({ container, name: 'name' }).value).toBe('Gate');
    expect(readField({ container, name: 'label' }).value).toBe('');
    expect(readField({ container, name: 'categories' }).value).toBe('');
  });

  it('shows an empty edit form when the response has no plugin', async () => {
    PedalboardService.getPlugin.mockResolvedValue({});
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    await flushPromises();

    expect(readField({ container: view.container, name: 'name' }).value).toBe('');
  });

  it('shows the message of a plugin that cannot be loaded', async () => {
    PedalboardService.getPlugin.mockRejectedValue(new Error('Plugin non trouvé'));
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    await flushPromises();

    const { container } = view;

    expect(container.querySelector('[role="alert"]').textContent).toBe('Plugin non trouvé');
    expect(readField({ container, name: 'name' }).value).toBe('');
  });

  it('fills the form with the plugin of a new route id', async () => {
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    await flushPromises();
    PedalboardService.getPlugin.mockResolvedValue({ data: REVERB });
    view.rerender(<EditPlugin match={{ params: { id: 'reverb' } }} />);
    await flushPromises();

    expect(PedalboardService.getPlugin.mock.calls).toEqual([['gate'], ['reverb']]);
    expect(readField({ container: view.container, name: 'name' }).value).toBe('Reverb');
  });

  it('keeps the plugin of the new route id when the previous one answers last', async () => {
    let answerPreviousPlugin;
    PedalboardService.getPlugin.mockReturnValueOnce(new Promise((resolve) => {
      answerPreviousPlugin = resolve;
    }));
    PedalboardService.getPlugin.mockResolvedValue({ data: REVERB });
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    view.rerender(<EditPlugin match={{ params: { id: 'reverb' } }} />);
    await flushPromises();
    answerPreviousPlugin({ data: GATE });
    await flushPromises();

    expect(readField({ container: view.container, name: 'name' }).value).toBe('Reverb');
  });

  it('updates nothing when the plugin answers after the page is left', async () => {
    let answerPlugin;
    jest.spyOn(console, 'error');
    PedalboardService.getPlugin.mockReturnValueOnce(new Promise((resolve) => {
      answerPlugin = resolve;
    }));
    view = render(<EditPlugin match={ROUTE_MATCH} />);
    view.unmount();
    view = undefined;
    answerPlugin({ data: GATE });
    await flushPromises();

    expect(console.error).not.toHaveBeenCalled();
  });

  it('requests nothing without a route id', async () => {
    view = render(<EditPlugin />);
    await flushPromises();

    expect(PedalboardService.getPlugin).not.toHaveBeenCalled();
    expect(view.container.querySelector('h1').textContent).toBe('Modifier le plugin');
  });
});
