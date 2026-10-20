// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Components
import FilterTooltipContent from './index';

describe('FilterTooltipContent', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  it('renders the heading, then what the link filters by', () => {
    ReactDOM.render(<FilterTooltipContent heading="Brand" value="MDA" kind="brands" />, div);

    expect(div.textContent).toBe('BrandClick to filter pluginby MDA brands.');
    expect([...div.querySelectorAll('b')].map(bold => bold.textContent)).toEqual(['Brand', 'MDA']);
  });

  it('renders the sentence without a heading or a kind', () => {
    ReactDOM.render(<FilterTooltipContent value="MDA" />, div);

    expect(div.textContent).toBe('Click to filter pluginby MDA.');
    expect(div.querySelectorAll('br')).toHaveLength(1);
    expect(div.textContent).not.toContain('undefined');
  });

  it('renders nothing without props', () => {
    ReactDOM.render(<FilterTooltipContent />, div);

    expect(div.innerHTML).toBe('');
  });

  it('renders nothing for an empty value', () => {
    ReactDOM.render(<FilterTooltipContent heading="Brand" value="" kind="brands" />, div);

    expect(div.innerHTML).toBe('');
  });

  it('displays a value holding markup as literal text', () => {
    ReactDOM.render(<FilterTooltipContent heading="Label" value="<b>x</b>" kind="labels" />, div);

    expect(div.textContent).toContain('<b>x</b>');
    expect(div.querySelectorAll('b')).toHaveLength(2);
  });
});
