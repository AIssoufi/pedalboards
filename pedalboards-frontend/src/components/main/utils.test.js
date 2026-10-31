// Constants
import { PLACEHOLDER_HEADING_CLASS } from './constants';

// Utils
import { isFinalHeading } from './utils';

const createHeading = (className = '') => {
  const heading = document.createElement('h1');

  heading.className = className;
  return heading;
};

describe('isFinalHeading', () => {
  it('is false on a page without a heading', () => {
    expect(isFinalHeading(null)).toBe(false);
  });

  it('is false for the placeholder of a page that is loading', () => {
    expect(isFinalHeading(createHeading(PLACEHOLDER_HEADING_CLASS))).toBe(false);
  });

  it('is false for a placeholder that carries another class too', () => {
    expect(isFinalHeading(createHeading(`title ${PLACEHOLDER_HEADING_CLASS}`))).toBe(false);
  });

  it.each(['', 'plugin-title'])('is true for a heading of class %p', (className) => {
    expect(isFinalHeading(createHeading(className))).toBe(true);
  });
});
