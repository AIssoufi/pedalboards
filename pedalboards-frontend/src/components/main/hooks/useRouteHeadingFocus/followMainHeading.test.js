// Utils
import followMainHeading from './followMainHeading';

const PLACEHOLDER_HTML = '<h1 class="visually-hidden" tabindex="-1">Plugin</h1>';
const FINAL_HTML = '<h1 tabindex="-1">abGate</h1>';
const OUTSIDE_BUTTON_NAME = 'Outside';

// Lets the observer see the changes made to the page so far
const flushObserver = () => new Promise((resolve) => {
  setTimeout(resolve);
});

describe('followMainHeading', () => {
  let container;
  let outsideButton;

  beforeEach(() => {
    container = document.createElement('main');
    outsideButton = document.createElement('button');
    outsideButton.textContent = OUTSIDE_BUTTON_NAME;
    document.body.append(outsideButton, container);
  });

  afterEach(() => {
    container.remove();
    outsideButton.remove();
  });

  it('focuses the heading of a loaded page, even from an element outside the page', () => {
    container.innerHTML = FINAL_HTML;
    outsideButton.focus();

    followMainHeading({ container, preventScroll: false });

    expect(document.activeElement.textContent).toBe('abGate');
  });

  it.each([true, false])('passes preventScroll %p to the focus', (preventScroll) => {
    container.innerHTML = FINAL_HTML;
    const focus = vi.spyOn(container.firstChild, 'focus');

    followMainHeading({ container, preventScroll });

    expect(focus).toHaveBeenCalledWith({ preventScroll });
  });

  it('has nothing to stop once the final heading has the focus', () => {
    container.innerHTML = FINAL_HTML;

    expect(followMainHeading({ container, preventScroll: false })).toBeUndefined();
  });

  it('follows each next heading until the final one', async () => {
    container.innerHTML = PLACEHOLDER_HTML;
    const stopFollowing = followMainHeading({ container, preventScroll: false });
    expect(document.activeElement).toBe(container.firstChild);

    container.innerHTML = PLACEHOLDER_HTML;
    await flushObserver();
    expect(document.activeElement).toBe(container.firstChild);

    container.innerHTML = FINAL_HTML;
    await flushObserver();
    expect(document.activeElement.textContent).toBe('abGate');
    stopFollowing();
  });

  it('keeps the same preventScroll while it follows', async () => {
    container.innerHTML = PLACEHOLDER_HTML;
    const stopFollowing = followMainHeading({ container, preventScroll: true });
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');

    container.innerHTML = FINAL_HTML;
    await flushObserver();

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    focus.mockRestore();
    stopFollowing();
  });

  it('waits for a heading on a page that has none yet', async () => {
    const stopFollowing = followMainHeading({ container, preventScroll: false });

    container.innerHTML = FINAL_HTML;
    await flushObserver();

    expect(document.activeElement.textContent).toBe('abGate');
    stopFollowing();
  });

  it('leaves the focus where the visitor moved it meanwhile', async () => {
    container.innerHTML = PLACEHOLDER_HTML;
    const stopFollowing = followMainHeading({ container, preventScroll: false });
    outsideButton.focus();

    container.innerHTML = FINAL_HTML;
    await flushObserver();

    expect(document.activeElement).toBe(outsideButton);
    stopFollowing();
  });

  it('stops at the final heading, so that a later reload takes no focus', async () => {
    container.innerHTML = PLACEHOLDER_HTML;
    followMainHeading({ container, preventScroll: false });
    container.innerHTML = FINAL_HTML;
    await flushObserver();

    document.activeElement.blur();
    container.innerHTML = FINAL_HTML;
    await flushObserver();

    expect(document.activeElement).toBe(document.body);
  });

  it('stops following when asked', async () => {
    container.innerHTML = PLACEHOLDER_HTML;
    const stopFollowing = followMainHeading({ container, preventScroll: false });

    stopFollowing();
    container.innerHTML = FINAL_HTML;
    await flushObserver();

    expect(document.activeElement).toBe(document.body);
  });
});
