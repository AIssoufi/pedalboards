// Dependencies
import React from 'react';
import { render, screen } from '@testing-library/react';

// Components
import Search from './index';

it('renders without crashing', () => {
  render(<Search onSubmit={() => { }} />);

  expect(screen.getByRole('textbox')).toBeDefined();
});
