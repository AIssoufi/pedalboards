// Utils
import followOpenedCard from './followOpenedCard';

const PATHNAME = '/plugin/abgate';
const OPENED_LINK_HTML = `<a href="${PATHNAME}">abGate</a>`;
const OTHER_LINK_HTML = '<a href="/plugin/ambience">Ambience</a>';
const FILTER_LINK_HTML = '<a href="/plugins?brand=MDA">MDA</a>';
const LOADER_HTML = '<p>Loading</p>';

// Lets the observer see the changes made to the page so far
const flushObserver = () => new Promise((resolve) => {
  setTimeout(resolve);
});

describe('followOpenedCard', () => {
  let container;
  let heading;
  let list;
  let outsideButton;
  let stopFollowing;

  const follow = (pathname = PATHNAME) => {
    stopFollowing = followOpenedCard({ container, pathname });
  };

  const openedLink = () => list.querySelector(`a[href="${PATHNAME}"]`);

  beforeEach(() => {
    container = document.createElement('main');
    container.innerHTML = '<h1 tabindex="-1">Plugins</h1><section></section>';
    heading = container.querySelector('h1');
    list = container.querySelector('section');
    outsideButton = document.createElement('button');
    document.body.append(outsideButton, container);
  });

  afterEach(() => {
    stopFollowing?.();
    stopFollowing = undefined;
    container.remove();
    outsideButton.remove();
    vi.restoreAllMocks();
  });

  it('focuses the link of the opened card, among the other links of the list', () => {
    list.innerHTML = OTHER_LINK_HTML + OPENED_LINK_HTML + FILTER_LINK_HTML;

    follow();

    expect(document.activeElement).toBe(openedLink());
  });

  it('finds the link of an encoded path, which a selector would have to escape', () => {
    const pathname = '/plugin/a%2Fb%22c%5D';
    list.innerHTML = `<a href="${pathname}">Odd</a>`;

    follow(pathname);

    expect(document.activeElement).toBe(list.firstChild);
  });

  it('keeps the scroll position when it focuses the link', () => {
    list.innerHTML = OPENED_LINK_HTML;
    const focus = vi.spyOn(openedLink(), 'focus');

    follow();

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it.each([
    ['an empty list', ''],
    ['a list without that card', OTHER_LINK_HTML],
    ['a link that only starts like it', `<a href="${PATHNAME}-2">Other</a>`],
    ['a link without an address', '<a>Nothing</a>']
  ])('focuses the heading with %s', (description, html) => {
    list.innerHTML = html;
    const focus = vi.spyOn(heading, 'focus');

    follow();

    expect(document.activeElement).toBe(heading);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('does not throw on a page without a heading or a link', () => {
    container.innerHTML = '';

    expect(() => follow()).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });

  it('goes to the heading without scrolling when a reload removes the focused card', async () => {
    list.innerHTML = OPENED_LINK_HTML + OTHER_LINK_HTML;
    follow();
    const focus = vi.spyOn(heading, 'focus');

    openedLink().remove();
    await flushObserver();

    expect(document.activeElement).toBe(heading);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('keeps the card when a reload leaves it in the list', async () => {
    list.innerHTML = OPENED_LINK_HTML;
    follow();
    const link = openedLink();

    list.insertAdjacentHTML('beforeend', OTHER_LINK_HTML);
    await flushObserver();

    expect(document.activeElement).toBe(link);
  });

  it('scrolls to the card once a list still loading shows it', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    list.innerHTML = LOADER_HTML;
    follow();
    expect(document.activeElement).toBe(heading);

    list.innerHTML = OPENED_LINK_HTML;
    await flushObserver();

    expect(document.activeElement).toBe(openedLink());
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: false });
  });

  it('does not scroll again when the list changes around the late card', async () => {
    list.innerHTML = LOADER_HTML;
    follow();
    list.innerHTML = OPENED_LINK_HTML;
    await flushObserver();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');

    list.insertAdjacentHTML('beforeend', OTHER_LINK_HTML);
    await flushObserver();

    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
  });

  it('stays on the heading when the list that loads has no such card', async () => {
    list.innerHTML = LOADER_HTML;
    follow();

    list.innerHTML = OTHER_LINK_HTML;
    await flushObserver();

    expect(document.activeElement).toBe(heading);
  });

  it('leaves the focus where the visitor moved it', async () => {
    list.innerHTML = LOADER_HTML;
    follow();
    outsideButton.focus();

    list.innerHTML = OPENED_LINK_HTML;
    await flushObserver();

    expect(document.activeElement).toBe(outsideButton);
  });

  it('leaves the focus on the page after a click on nothing', async () => {
    list.innerHTML = OPENED_LINK_HTML + OTHER_LINK_HTML;
    follow();
    openedLink().blur();

    list.lastChild.remove();
    await flushObserver();

    expect(document.activeElement).toBe(document.body);
  });

  it('stops for good once the visitor moved the focus', async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    list.innerHTML = OPENED_LINK_HTML;
    follow();
    outsideButton.focus();

    list.innerHTML = OTHER_LINK_HTML;
    await flushObserver();

    expect(disconnect).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(outsideButton);
  });

  it('leaves the focus elsewhere when the visitor moved it before the removal', async () => {
    list.innerHTML = OPENED_LINK_HTML;
    follow();
    outsideButton.focus();

    openedLink().remove();
    await flushObserver();

    expect(document.activeElement).toBe(outsideButton);
  });

  it('moves nothing once stopped', async () => {
    list.innerHTML = LOADER_HTML;
    follow();

    stopFollowing();
    list.innerHTML = OPENED_LINK_HTML;
    await flushObserver();

    expect(document.activeElement).toBe(heading);
  });
});
