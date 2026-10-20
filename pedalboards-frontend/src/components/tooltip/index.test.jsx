// Dependencies
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// Components
import Tooltip from './index';

/**
 * Gives the tooltip that describes an element.
 *
 * @param {HTMLElement} element - Element with an `aria-describedby` attribute.
 * @returns {?HTMLElement} The tooltip, `null` when the element has no description.
 */
const getDescription = element => document.getElementById(element.getAttribute('aria-describedby'));

/**
 * Tells whether a tooltip shows.
 *
 * @param {HTMLElement} tooltip - Bubble of the tooltip.
 * @returns {boolean} True when it holds the class that shows it.
 */
const isShown = tooltip => tooltip.classList.contains('open');

describe('Tooltip', () => {
  it('renders the children described by a hidden tooltip', () => {
    render(<Tooltip content="Save the plugin"><button type="button">Save</button></Tooltip>);

    const tooltip = getDescription(screen.getByRole('button'));
    expect(tooltip).toBe(screen.getByRole('tooltip'));
    expect(tooltip.textContent).toBe('Save the plugin');
    expect(isShown(tooltip)).toBe(false);
  });

  it('renders the bubble at the end of the page, out of the children', () => {
    const { container } = render(
      <Tooltip content="Save the plugin"><button type="button">Save</button></Tooltip>
    );

    expect(container.contains(screen.getByRole('tooltip'))).toBe(false);
    expect(document.body.lastElementChild).toBe(screen.getByRole('tooltip'));
  });

  it('shows the tooltip while the pointer is over the children', () => {
    render(<Tooltip content="Save the plugin"><button type="button">Save</button></Tooltip>);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);
    expect(isShown(screen.getByRole('tooltip'))).toBe(true);

    fireEvent.mouseLeave(button);
    expect(isShown(screen.getByRole('tooltip'))).toBe(false);
  });

  it('shows the tooltip while the focus is inside the children', () => {
    render(<Tooltip content="Save the plugin"><button type="button">Save</button></Tooltip>);
    const button = screen.getByRole('button');

    fireEvent.focus(button);
    expect(isShown(screen.getByRole('tooltip'))).toBe(true);

    fireEvent.blur(button);
    expect(isShown(screen.getByRole('tooltip'))).toBe(false);
  });

  it('hides the tooltip on Escape', () => {
    render(<Tooltip content="Save the plugin"><button type="button">Save</button></Tooltip>);
    const button = screen.getByRole('button');
    fireEvent.focus(button);

    fireEvent.keyDown(button, { key: 'Escape' });

    expect(isShown(screen.getByRole('tooltip'))).toBe(false);
  });

  it('keeps the description that the child already had', () => {
    render(
      <Tooltip content="Save the plugin">
        <button type="button" aria-describedby="hint">Save</button>
      </Tooltip>
    );

    const descriptionIds = screen.getByRole('button').getAttribute('aria-describedby').split(' ');
    expect(descriptionIds).toEqual(['hint', screen.getByRole('tooltip').id]);
  });

  it('gives each tooltip its own id', () => {
    render(
      <>
        <Tooltip content="First"><button type="button">1</button></Tooltip>
        <Tooltip content="Second"><button type="button">2</button></Tooltip>
      </>
    );

    const descriptions = screen.getAllByRole('button').map(getDescription);
    expect(descriptions.map(tooltip => tooltip.textContent)).toEqual(['First', 'Second']);
  });

  it('shows the tooltip of a text without describing it', () => {
    const { container } = render(<Tooltip content="More">Hover me</Tooltip>);

    fireEvent.mouseEnter(screen.getByText('Hover me'));

    expect(isShown(screen.getByRole('tooltip'))).toBe(true);
    expect(container.querySelector('[aria-describedby]')).toBeNull();
  });

  it.each([
    ['bottom', 'bottom'],
    ['top', 'top'],
    ['left', 'top'],
    [undefined, 'top']
  ])('shows the bubble for the placement %j on the %s side', (placement, side) => {
    render(
      <Tooltip content="Save the plugin" placement={placement}>
        <button type="button">Save</button>
      </Tooltip>
    );

    expect(screen.getByRole('tooltip').classList.contains(side)).toBe(true);
  });

  describe('edge cases', () => {
    it.each([
      ['missing', undefined],
      ['null', null],
      ['empty', ''],
      ['false', false]
    ])('renders the children alone when the content is %s', (description, content) => {
      render(<Tooltip content={content}><button type="button">Save</button></Tooltip>);

      expect(screen.getByRole('button').hasAttribute('aria-describedby')).toBe(false);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it.each([
      ['missing', undefined],
      ['null', null],
      ['empty', '']
    ])('renders nothing when the children are %s', (description, children) => {
      const { container } = render(<Tooltip content="Save the plugin">{children}</Tooltip>);

      expect(container.innerHTML).toBe('');
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('renders nothing without props', () => {
      const { container } = render(<Tooltip />);

      expect(container.innerHTML).toBe('');
    });

    it('shows content holding markup as literal text', () => {
      const markup = '<b>x</b>';
      render(<Tooltip content={markup}><button type="button">Save</button></Tooltip>);

      expect(screen.getByRole('tooltip').textContent).toBe(markup);
      expect(screen.getByRole('tooltip').querySelector('b')).toBeNull();
    });

    it('removes the bubble from the page on unmount', () => {
      const { unmount } = render(
        <Tooltip content="Save the plugin"><button type="button">Save</button></Tooltip>
      );

      unmount();

      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});
