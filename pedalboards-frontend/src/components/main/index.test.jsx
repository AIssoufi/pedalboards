// Dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Link, MemoryRouter, Route, Routes
} from 'react-router';

// Components
import Main from './index';

const renderInRouter = children => render(<MemoryRouter>{children}</MemoryRouter>);

it('renders an empty main area with no props', () => {
  renderInRouter(<Main />);

  expect(screen.getByRole('main')).toHaveProperty('className', 'main-container');
  expect(screen.getByRole('main').childElementCount).toBe(0);
});

it('moves the focus to the heading of the page a link opens', () => {
  renderInRouter(
    <Main>
      <Routes>
        <Route path="/" element={<Link to="/plugins">Open</Link>} />
        <Route path="/plugins" element={<h1 tabIndex={-1}>Plugins</h1>} />
      </Routes>
    </Main>
  );

  fireEvent.click(screen.getByRole('link', { name: 'Open' }));

  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Plugins' }));
});
