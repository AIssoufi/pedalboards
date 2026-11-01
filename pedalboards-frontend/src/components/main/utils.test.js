// Constants
import { PLACEHOLDER_HEADING_CLASS } from './constants';

// Utils
import { isFinalHeading, isFocusLost } from './utils';

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

describe('isFocusLost', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('is true when only the body has the focus', () => {
    expect(isFocusLost()).toBe(true);
  });

  it('is true when the focused element has just been removed', () => {
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();

    button.remove();

    expect(isFocusLost()).toBe(true);
  });

  it('is true when the document names no active element', () => {
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null);

    expect(isFocusLost()).toBe(true);
  });

  it('is false while an element holds the focus', () => {
    const button = document.createElement('button');
    document.body.append(button);

    button.focus();

    expect(isFocusLost()).toBe(false);
  });
});
