// Dependencies
import { render, screen } from '@testing-library/react';

// Components
import Loader from './index';

const LOADER_TEXT = 'Je Fais ça En Deux Deux...';

it('shows its text in French inside the English page', () => {
  render(<Loader />);

  expect(screen.getByText(LOADER_TEXT).lang).toBe('fr');
});
