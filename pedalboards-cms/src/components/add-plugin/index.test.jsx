// Dependencies
import React from 'react';

// Services
import { PedalboardService } from 'services';

// Utils
import { flushPromises, render, submitForm } from 'utils/testing';

// Components
import AddPlugin from './index';

const TEXT_FIELDS = ['name', 'label', 'uri', 'version', 'brand', 'categories', 'description'];

const FIELD_NAMES = [
  'Name', 'Label', 'URI', 'Version', 'Brand', 'Categories', 'Description', 'Screenshot',
  'Control port name', 'Default value', 'Maximal value', 'Minimal value'
];

const GATE = {
  id: 'gate',
  name: 'Gate',
  label: 'Noise gate',
  uri: 'https://example.com/gate',
  version: '1.0.0',
  brand: 'MDA',
  categories: ['Dynamics', 'Gate'],
  description: 'Cuts the noise',
  controlPorts: [{
    name: 'Threshold', default: 0.5, max: 1, min: 0
  }]
};

const readMainForm = container => container.querySelector('form');

const readSentForm = method => method.mock.calls[0][1];

const readErrorText = (container) => {
  const error = container.querySelector('[role="alert"]');

  return error && error.textContent;
};

const isPropTypeWarning = ([message]) => String(message).includes('Failed prop type');

const readPropTypeWarnings = () => console.error.mock.calls.filter(isPropTypeWarning);

const readField = ({ container, name }) => container.querySelector(`[name="${name}"]`);

describe('AddPlugin', () => {
  let view;

  beforeEach(() => {
    jest.spyOn(console, 'error');
    jest.spyOn(PedalboardService, 'createPlugin').mockResolvedValue({ data: GATE });
    jest.spyOn(PedalboardService, 'updatePlugin').mockResolvedValue({ data: GATE });
  });

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
    jest.restoreAllMocks();
  });

  it('renders an empty create form without any props', () => {
    view = render(<AddPlugin />);

    const { container } = view;
    const fieldValues = TEXT_FIELDS.map(name => readField({ container, name }).value);

    expect(fieldValues).toEqual(TEXT_FIELDS.map(() => ''));
    expect(container.querySelector('button[type="submit"]').textContent).toContain('Create');
    expect(readPropTypeWarnings()).toEqual([]);
  });

  it('marks its English fields, button and control ports inside the French page', () => {
    view = render(<AddPlugin />);

    const { container } = view;
    const englishElements = [
      ...container.querySelectorAll('input[placeholder], textarea'),
      container.querySelector('button[type="submit"]'),
      container.querySelector('.control-ports')
    ];

    expect(englishElements.map(element => element.closest('[lang]').lang))
      .toEqual(englishElements.map(() => 'en'));
    expect(container.querySelector('h1').closest('[lang]')).toBeNull();
  });

  it('leaves the main landmark to the app, which already wraps the page in one', () => {
    view = render(<AddPlugin />);

    expect(view.container.querySelector('main')).toBeNull();
  });

  it('names each field of the plugin and of the control ports in English', () => {
    view = render(<AddPlugin />);

    const fields = [...view.container.querySelectorAll('input, textarea')];

    expect(fields.map(field => field.getAttribute('aria-label'))).toEqual(FIELD_NAMES);
    expect(fields.map(field => field.closest('[lang]').lang)).toEqual(FIELD_NAMES.map(() => 'en'));
  });

  it('gives an example of categories in the placeholder of their field', () => {
    view = render(<AddPlugin />);

    expect(readField({ container: view.container, name: 'categories' }).placeholder)
      .toBe('Category A, category B, category C, etc.');
  });

  it('names its icon buttons after what they do', () => {
    view = render(<AddPlugin edit {...GATE} />);

    const iconButtons = view.container.querySelectorAll('.control-ports button');

    expect([...iconButtons].map(button => button.getAttribute('aria-label')))
      .toEqual(['Add the control port', 'Remove Threshold']);
  });

  it('names a control port without a name generically in the tooltip of its remove button', () => {
    view = render(<AddPlugin edit {...GATE} controlPorts={[{ default: 0.5, max: 1, min: 0 }]} />);

    const removeButton = view.container.querySelector('.control-ports [aria-label^="Remove"]');
    const tooltip = removeButton.parentElement;
    // react-tippy moves the title of the element it wraps to data-original-title
    expect(tooltip.getAttribute('data-original-title')).toBe('Click to remove this control port');
  });

  it('leaves the categories empty when they are not a list', () => {
    view = render(<AddPlugin categories={null} />);

    expect(readField({ container: view.container, name: 'categories' }).value).toBe('');
  });

  it('joins the categories of the plugin', () => {
    view = render(<AddPlugin categories={['Dynamics', 'Gate']} />);

    expect(readField({ container: view.container, name: 'categories' }).value)
      .toBe('Dynamics, Gate');
  });

  describe('on create', () => {
    it('requires an image and shows the create title', () => {
      view = render(<AddPlugin />);

      expect(readField({ container: view.container, name: 'image' }).required).toBe(true);
      expect(view.container.querySelector('h1').textContent).toBe('Ajouter un plugin');
    });

    it('creates the plugin with its sample control ports and an empty author', async () => {
      view = render(<AddPlugin />);
      submitForm(readMainForm(view.container));
      await flushPromises();

      const [[formData]] = PedalboardService.createPlugin.mock.calls;

      expect(PedalboardService.updatePlugin).not.toHaveBeenCalled();
      expect(JSON.parse(formData.get('controlPorts'))).toHaveLength(2);
      expect(JSON.parse(formData.get('author'))).toEqual({ avatarUrl: '', name: '' });
      expect(readErrorText(view.container)).toBeNull();
    });

    it('shows the message of a failed create and keeps the fields', async () => {
      PedalboardService.createPlugin.mockRejectedValue(
        new Error('a plugin with this name already exists')
      );
      view = render(<AddPlugin />);

      const nameField = readField({ container: view.container, name: 'name' });

      nameField.value = 'Gate';
      submitForm(readMainForm(view.container));
      await flushPromises();

      expect(readErrorText(view.container)).toBe('a plugin with this name already exists');
      expect(nameField.value).toBe('Gate');
    });

    it('shows a fallback message for an error without one', async () => {
      PedalboardService.createPlugin.mockRejectedValue(new Error(''));
      view = render(<AddPlugin />);
      submitForm(readMainForm(view.container));
      await flushPromises();

      expect(readErrorText(view.container)).toBe('La requête a échoué');
    });
  });

  describe('on edit', () => {
    it('shows the edit title and the fields of the plugin, with an optional image', () => {
      view = render(<AddPlugin edit {...GATE} />);

      const { container } = view;

      expect(container.querySelector('h1').textContent).toBe('Modifier le plugin');
      expect(readField({ container, name: 'name' }).value).toBe('Gate');
      expect(readField({ container, name: 'label' }).value).toBe('Noise gate');
      expect(readField({ container, name: 'image' }).required).toBe(false);
      expect(container.querySelector('button[type="submit"]').textContent).toContain('Update');
    });

    it('updates the plugin of its id with the fields of the form', async () => {
      view = render(<AddPlugin edit {...GATE} />);
      submitForm(readMainForm(view.container));
      await flushPromises();

      const [[id, formData]] = PedalboardService.updatePlugin.mock.calls;

      expect(PedalboardService.createPlugin).not.toHaveBeenCalled();
      expect(id).toBe('gate');
      expect(formData.get('name')).toBe('Gate');
      expect(formData.get('categories')).toBe('Dynamics, Gate');
      expect(JSON.parse(formData.get('controlPorts'))).toEqual(GATE.controlPorts);
    });

    it('keeps the author and the image when none is chosen', async () => {
      view = render(<AddPlugin edit {...GATE} />);
      submitForm(readMainForm(view.container));
      await flushPromises();

      const formData = readSentForm(PedalboardService.updatePlugin);

      expect(formData.has('author')).toBe(false);
      expect(formData.has('image')).toBe(false);
    });

    it('keeps the fields of the form once the plugin is saved', async () => {
      view = render(<AddPlugin edit {...GATE} />);

      const nameField = readField({ container: view.container, name: 'name' });

      nameField.value = 'Gate 2';
      submitForm(readMainForm(view.container));
      await flushPromises();

      expect(nameField.value).toBe('Gate 2');
    });

    it('starts without control ports when the plugin has none', () => {
      view = render(<AddPlugin edit id="gate" name="Gate" />);

      expect(view.container.querySelectorAll('.control-ports tbody tr')).toHaveLength(1);
    });

    it('takes the control ports of the plugin once it is loaded', () => {
      view = render(<AddPlugin edit />);
      view.rerender(<AddPlugin edit {...GATE} />);

      const portRows = view.container.querySelectorAll('.control-ports tbody tr');

      expect(portRows).toHaveLength(2);
      expect(portRows[1].textContent).toContain('Threshold');
    });

    it('shows the message of a failed update', async () => {
      PedalboardService.updatePlugin.mockRejectedValue(new Error('Plugin non trouvé'));
      view = render(<AddPlugin edit {...GATE} />);
      submitForm(readMainForm(view.container));
      await flushPromises();

      expect(readErrorText(view.container)).toBe('Plugin non trouvé');
    });

    it('clears the message once a new save succeeds', async () => {
      PedalboardService.updatePlugin.mockRejectedValueOnce(new Error('invalid parameters'));
      view = render(<AddPlugin edit {...GATE} />);
      submitForm(readMainForm(view.container));
      await flushPromises();
      submitForm(readMainForm(view.container));
      await flushPromises();

      expect(readErrorText(view.container)).toBeNull();
    });

    it('sends nothing without the id of the plugin', async () => {
      view = render(<AddPlugin edit name="Gate" />);
      submitForm(readMainForm(view.container));
      await flushPromises();

      expect(PedalboardService.updatePlugin).not.toHaveBeenCalled();
      expect(PedalboardService.createPlugin).not.toHaveBeenCalled();
    });
  });
});
