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

it('calls onSubmit with the form when the select loses the focus', () => {
  const onSubmit = vi.fn();
  render(<Search onSubmit={onSubmit} />);
  const select = screen.getByRole('combobox');
  select.value = 'label';

  fireEvent.blur(select);

  expect(onSubmit).toHaveBeenCalledTimes(1);
  const [formData] = onSubmit.mock.calls[0];
  expect(Object.fromEntries(formData)).toEqual({ value: '', label: 'label' });
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
