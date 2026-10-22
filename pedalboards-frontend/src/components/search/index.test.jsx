// Dependencies
import { fireEvent, render, screen } from '@testing-library/react';

// Components
import Search from './index';

// Constants
import { SEARCH_DEBOUNCE_MS } from './constants';

/**
 * Gives the tooltip that describes an element.
 *
 * @param {HTMLElement} element - Element with an `aria-describedby` attribute.
 * @returns {?HTMLElement} The tooltip, `null` when the element has no description.
 */
const getDescription = element => document.getElementById(element.getAttribute('aria-describedby'));

it('renders without crashing', () => {
  render(<Search onSubmit={() => { }} />);

  expect(screen.getByRole('textbox')).toBeDefined();
});

it('names each field to search in', () => {
  render(<Search />);

  const optionTexts = screen.getAllByRole('option').map(option => option.textContent);
  expect(optionTexts).toEqual(['brand', 'category', 'label']);
});

it('calls onSubmit with the text and the field to search in', () => {
  const onSubmit = vi.fn();
  render(<Search onSubmit={onSubmit} />);
  const input = screen.getByRole('textbox');
  input.value = 'MDA';
  screen.getByRole('combobox').value = 'categories';

  fireEvent.submit(input.form);

  expect(onSubmit).toHaveBeenCalledTimes(1);
  const [formData] = onSubmit.mock.calls[0];
  expect(Object.fromEntries(formData)).toEqual({ value: 'MDA', label: 'categories' });
});

it('calls onSubmit with the form once the typing in the text field pauses', () => {
  vi.useFakeTimers();
  try {
    const onSubmit = vi.fn();
    render(<Search onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'MDA' } });
    expect(onSubmit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [formData] = onSubmit.mock.calls[0];
    expect(Object.fromEntries(formData)).toEqual({ value: 'MDA', label: 'brand' });
  } finally {
    vi.useRealTimers();
  }
});

it('submits nothing when the focus leaves the select', () => {
  const onSubmit = vi.fn();
  render(<Search onSubmit={onSubmit} />);
  const select = screen.getByRole('combobox');

  fireEvent.focus(select);
  fireEvent.blur(select);

  expect(onSubmit).not.toHaveBeenCalled();
});

it('calls onSubmit with the form once the choice of the select pauses', () => {
  vi.useFakeTimers();
  try {
    const onSubmit = vi.fn();
    render(<Search onSubmit={onSubmit} />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'categories' } });
    fireEvent.change(select, { target: { value: 'label' } });
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    expect(onSubmit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [formData] = onSubmit.mock.calls[0];
    expect(Object.fromEntries(formData)).toEqual({ value: '', label: 'label' });
  } finally {
    vi.useRealTimers();
  }
});

it('names the text field and the search button, and ties the label to the select', () => {
  render(<Search />);

  expect(screen.getByRole('textbox', { name: 'Search Plugins' })).toBeDefined();
  expect(screen.getByRole('button', { name: 'Search' })).toBeDefined();
  expect(screen.getByLabelText('in').tagName).toBe('SELECT');
});

it('gives each search its own select id', () => {
  render(<><Search /><Search /></>);

  const [firstSelect, secondSelect] = screen.getAllByLabelText('in');
  expect(firstSelect.id).not.toBe(secondSelect.id);
});

it('submits without onSubmit', () => {
  render(<Search />);

  expect(() => fireEvent.submit(screen.getByRole('textbox').form)).not.toThrow();
});

it('describes the search button and the select with their tooltips', () => {
  render(<Search />);

  expect(getDescription(screen.getByRole('button')).textContent)
    .toBe('Click to launch the search');
  expect(getDescription(screen.getByRole('combobox')).textContent).toBe('Choose a search filter');
});

it('shows the tooltip of the search button when it gets the focus', () => {
  render(<Search />);
  const button = screen.getByRole('button');

  fireEvent.focus(button);

  expect(getDescription(button).classList.contains('open')).toBe(true);
});

describe('with the filter of the URL', () => {
  const getText = () => screen.getByRole('textbox');
  const getField = () => screen.getByRole('combobox');

  it('shows the value and the field of the filter', () => {
    render(<Search value="Gx" field="label" />);

    expect(getText().value).toBe('Gx');
    expect(getField().value).toBe('label');
  });

  it.each([
    ['without a filter', {}],
    ['for values that are not texts', { field: 2, value: { x: 1 } }]
  ])('shows an empty text in the brand %s', (description, props) => {
    render(<Search {...props} />);

    expect(getField().value).toBe('brand');
    expect(getText().value).toBe('');
  });

  it('shows the text of an unknown field in the brand', () => {
    render(<Search field="name" value="Gx" />);

    expect(getField().value).toBe('brand');
    expect(getText().value).toBe('Gx');
  });

  it('follows a new filter of the URL', () => {
    const { rerender } = render(<Search value="Gx" field="label" />);

    rerender(<Search value="Delay" field="categories" />);

    expect(getText().value).toBe('Delay');
    expect(getField().value).toBe('categories');
  });

  it('empties the fields when the URL loses its filter', () => {
    const { rerender } = render(<Search value="Gx" field="label" />);

    rerender(<Search />);

    expect(getText().value).toBe('');
    expect(getField().value).toBe('brand');
  });

  it('keeps the text as typed when the URL searches the same value', () => {
    const { rerender } = render(<Search />);
    fireEvent.change(getText(), { target: { value: 'Gx ' } });

    rerender(<Search value="Gx" field="brand" />);

    expect(getText().value).toBe('Gx ');
  });

  it('keeps the typed text while the filter of the URL stays the same', () => {
    const { rerender } = render(<Search value="Gx" field="label" />);
    fireEvent.change(getText(), { target: { value: 'Gx2' } });

    rerender(<Search value="Gx" field="label" />);

    expect(getText().value).toBe('Gx2');
  });
});

describe('with the debounce delay of the text field', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onSubmit once for several keystrokes, with the last text', () => {
    const onSubmit = vi.fn();
    render(<Search onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');

    ['M', 'MD', 'MDA'].forEach((value) => {
      fireEvent.change(input, { target: { value } });
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS / 2);
    });
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].get('value')).toBe('MDA');
  });

  it('calls onSubmit once when the text is submitted before the delay is over', () => {
    const onSubmit = vi.fn();
    render(<Search onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'MDA' } });
    fireEvent.submit(input.form);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits nothing once it is unmounted', () => {
    const onSubmit = vi.fn();
    const { unmount } = render(<Search onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'MDA' } });
    unmount();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls the onSubmit of the last render', () => {
    const first = vi.fn();
    const last = vi.fn();
    const { rerender } = render(<Search onSubmit={first} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'MDA' } });
    rerender(<Search onSubmit={last} />);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(first).not.toHaveBeenCalled();
    expect(last).toHaveBeenCalledTimes(1);
  });
});
