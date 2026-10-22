// Dependencies
import React from 'react';

// Utils
import { render } from 'utils/testing';

// Components
import AddPlugin from './index';

const TEXT_FIELDS = ['name', 'label', 'uri', 'version', 'brand', 'categories', 'description'];

const isPropTypeWarning = ([message]) => String(message).includes('Failed prop type');

const readPropTypeWarnings = () => console.error.mock.calls.filter(isPropTypeWarning);

const readField = ({ container, name }) => container.querySelector(`[name="${name}"]`);

describe('AddPlugin', () => {
  let view;

  beforeEach(() => {
    jest.spyOn(console, 'error');
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

  it('leaves the categories empty when they are not a list', () => {
    view = render(<AddPlugin categories={null} />);

    expect(readField({ container: view.container, name: 'categories' }).value).toBe('');
  });

  it('joins the categories of the plugin', () => {
    view = render(<AddPlugin categories={['Dynamics', 'Gate']} />);

    expect(readField({ container: view.container, name: 'categories' }).value)
      .toBe('Dynamics, Gate');
  });
});
