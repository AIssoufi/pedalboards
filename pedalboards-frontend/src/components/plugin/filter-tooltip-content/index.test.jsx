// Dependencies
import { render, screen } from '@testing-library/react';

// Components
import FilterTooltipContent from './index';

describe('FilterTooltipContent', () => {
  it('renders the heading, then what the link filters by', () => {
    const { container } = render(
      <FilterTooltipContent heading="Brand" value="MDA" kind="brands" />
    );

    expect(container.textContent).toBe('BrandClick to filter pluginby MDA brands.');
    expect(screen.getByText('Brand').tagName).toBe('B');
    expect(screen.getByText('MDA').tagName).toBe('B');
  });

  it('renders the sentence without a heading or a kind', () => {
    const { container } = render(<FilterTooltipContent value="MDA" />);

    expect(container.textContent).toBe('Click to filter pluginby MDA.');
    expect(container.querySelectorAll('br')).toHaveLength(1);
    expect(container.textContent).not.toContain('undefined');
  });

  it('renders nothing without props', () => {
    const { container } = render(<FilterTooltipContent />);

    expect(container.innerHTML).toBe('');
  });

  it('renders nothing for an empty value', () => {
    const { container } = render(
      <FilterTooltipContent heading="Brand" value="" kind="brands" />
    );

    expect(container.innerHTML).toBe('');
  });

  it('displays a value holding markup as literal text', () => {
    const { container } = render(
      <FilterTooltipContent heading="Label" value="<b>x</b>" kind="labels" />
    );

    expect(screen.getByText('<b>x</b>').tagName).toBe('B');
    expect(container.querySelectorAll('b')).toHaveLength(2);
  });
});
