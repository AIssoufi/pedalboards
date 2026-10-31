// Dependencies
import { render, screen } from '@testing-library/react';

// Components
import Loader from './index';

const LOADER_TEXT = 'Loading...';

it('shows its waiting text in the language of the page', () => {
  render(<Loader />);

  expect(screen.getByText(LOADER_TEXT).closest('[lang]')).toBeNull();
});

it('exposes the waiting as a status named by its text', () => {
  render(<Loader />);

  expect(screen.getByRole('status').textContent).toBe(LOADER_TEXT);
});
