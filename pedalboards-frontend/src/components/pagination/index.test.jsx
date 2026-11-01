// Dependencies
import { fireEvent, render, screen } from '@testing-library/react';

// Components
import Pagination from './index';

// Names of the controls around the page numbers
const END_BUTTON_NAMES = ['PREVIOUS', 'NEXT'];

it('renders without crashing', () => {
  render(<Pagination currentPage={6} elementCount={54} onCurrentPageChange={() => { }} />);

  expect(screen.getByRole('button', { name: '6' })).toBeDefined();
});

describe('Pagination', () => {
  let container;

  /**
   * Renders the pagination and keeps the element that holds it.
   *
   * @param {Object} [props] - Props of the pagination.
   */
  const renderPagination = (props) => {
    ({ container } = render(<Pagination {...props} />));
  };

  const getItemTexts = () => [...container.querySelectorAll('.page-numbers > *')]
    .map(item => item.textContent);

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('shows the first, nearby and last pages with a gap for the others', () => {
    renderPagination({ currentPage: 6, elementCount: 54 });

    expect(getItemTexts()).toEqual(['1', '...', '5', '6', '7', '...', '54']);
    expect(screen.getByRole('button', { name: '6' }).className).toBe('current-page');
    expect(screen.getAllByText('...').map(gap => gap.tagName)).toEqual(['SPAN', 'SPAN']);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('marks the shown page as the current one, and only that page', () => {
    renderPagination({ currentPage: 6, elementCount: 54 });

    const currentPages = container.querySelectorAll('[aria-current]');

    expect([...currentPages].map(page => page.textContent)).toEqual(['6']);
    expect(currentPages[0].getAttribute('aria-current')).toBe('page');
  });

  it('shows each page of a short list once', () => {
    renderPagination({ currentPage: 1, elementCount: 3 });

    expect(getItemTexts()).toEqual(['1', '2', '3']);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('calls back with the page number that is clicked', () => {
    const onCurrentPageChange = vi.fn();
    renderPagination({ currentPage: 6, elementCount: 54, onCurrentPageChange });

    fireEvent.click(screen.getByRole('button', { name: '54' }));
    fireEvent.click(screen.getByRole('button', { name: 'PREVIOUS' }));
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }));

    expect(onCurrentPageChange.mock.calls).toEqual([[54], [5], [7]]);
  });

  it('makes PREVIOUS and NEXT buttons that the keyboard reaches and presses', () => {
    renderPagination({ currentPage: 6, elementCount: 54 });

    END_BUTTON_NAMES.forEach((name) => {
      const button = screen.getByRole('button', { name });

      // A native button takes the focus with Tab and clicks on Enter and Space
      expect(button.tagName).toBe('BUTTON');
      expect(button.type).toBe('button');
      expect(button.hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('at the ends of the pages', () => {
    const getButton = name => screen.getByRole('button', { name });
    const getDisabledStates = () => END_BUTTON_NAMES
      .map(name => getButton(name).getAttribute('aria-disabled'));

    it.each([
      ['the first page', 1, 5, ['true', 'false']],
      ['the page after the first', 2, 5, ['false', 'false']],
      ['the page before the last', 4, 5, ['false', 'false']],
      ['the last page', 5, 5, ['false', 'true']],
      ['the only page', 1, 1, ['true', 'true']],
      ['a page past the last', 9, 5, ['false', 'true']]
    ])('exposes the disabled state on %s', (_, currentPage, elementCount, expected) => {
      renderPagination({ currentPage, elementCount });

      expect(getDisabledStates()).toEqual(expected);
    });

    it.each([NaN, undefined, null, 0, -1, 2.5, '3'])(
      'treats the invalid page %p as the first page',
      (currentPage) => {
        renderPagination({ currentPage, elementCount: 5 });

        expect(getDisabledStates()).toEqual(['true', 'false']);
      }
    );

    it('does not call back from PREVIOUS on the first page', () => {
      const onCurrentPageChange = vi.fn();
      renderPagination({ currentPage: 1, elementCount: 5, onCurrentPageChange });

      fireEvent.click(getButton('PREVIOUS'));

      expect(onCurrentPageChange).not.toHaveBeenCalled();
    });

    it('does not call back from NEXT on the last page', () => {
      const onCurrentPageChange = vi.fn();
      renderPagination({ currentPage: 5, elementCount: 5, onCurrentPageChange });

      fireEvent.click(getButton('NEXT'));

      expect(onCurrentPageChange).not.toHaveBeenCalled();
    });

    it('calls back from the control of the other end', () => {
      const onCurrentPageChange = vi.fn();
      const { rerender } = render(
        <Pagination currentPage={1} elementCount={5} onCurrentPageChange={onCurrentPageChange} />
      );

      fireEvent.click(getButton('NEXT'));
      rerender(
        <Pagination currentPage={5} elementCount={5} onCurrentPageChange={onCurrentPageChange} />
      );
      fireEvent.click(getButton('PREVIOUS'));

      expect(onCurrentPageChange.mock.calls).toEqual([[2], [4]]);
    });

    it('keeps the focus on NEXT when it reaches the last page', () => {
      const { rerender } = render(<Pagination currentPage={4} elementCount={5} />);
      const nextButton = getButton('NEXT');
      nextButton.focus();

      rerender(<Pagination currentPage={5} elementCount={5} />);

      expect(getButton('NEXT')).toBe(nextButton);
      expect(document.activeElement).toBe(nextButton);
      expect(nextButton.disabled).toBe(false);
    });

    it('keeps the focus on PREVIOUS when it reaches the first page', () => {
      const { rerender } = render(<Pagination currentPage={2} elementCount={5} />);
      const previousButton = getButton('PREVIOUS');
      previousButton.focus();

      rerender(<Pagination currentPage={1} elementCount={5} />);

      expect(getButton('PREVIOUS')).toBe(previousButton);
      expect(document.activeElement).toBe(previousButton);
      expect(previousButton.disabled).toBe(false);
    });

    it('keeps the two ends in the order of the keyboard', () => {
      renderPagination({ currentPage: 1, elementCount: 1 });

      END_BUTTON_NAMES.forEach((name) => {
        expect(getButton(name).hasAttribute('tabindex')).toBe(false);
      });
    });
  });

  it('keeps the arrows as wide as their glyph, not the fixed width of Font Awesome 7', () => {
    renderPagination({ currentPage: 2, elementCount: 3 });

    const arrows = [...container.querySelectorAll('svg')];
    expect(arrows).toHaveLength(2);
    arrows.forEach(arrow => expect(arrow.classList.contains('fa-width-auto')).toBe(true));
  });

  it('renders nothing without props', () => {
    renderPagination();

    expect(container.innerHTML).toBe('');
  });

  it.each([0, -1, NaN, 2.5])('renders nothing for %p pages', (elementCount) => {
    renderPagination({ currentPage: 1, elementCount });

    expect(container.innerHTML).toBe('');
  });

  it('shows the first page and clicks safely without a valid page or a callback', () => {
    renderPagination({ currentPage: NaN, elementCount: 3 });

    expect(screen.getByRole('button', { name: '1' }).className).toBe('current-page');
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'NEXT' }))).not.toThrow();
  });
});
