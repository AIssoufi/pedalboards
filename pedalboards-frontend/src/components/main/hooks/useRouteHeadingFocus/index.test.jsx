// Dependencies
import { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import {
  Link, MemoryRouter, Navigate, Route, Routes, useNavigate
} from 'react-router';

// Hooks
import useRouteHeadingFocus from './index';

// Constants
import { HOME_PATHNAME, PLUGINS_PATHNAME } from '../../../../constants/routes';

const LIST_HEADING = 'Plugins';
const DETAILS_HEADING = 'abGate';
const OPENED_CARD_NAME = 'abGate card';
const OTHER_CARD_NAME = 'Ambience card';
const OPENED_PATHNAME = '/plugin/abgate';
const OTHER_PATHNAME = '/plugin/ambience';
const EMPTY_PATHNAME = '/empty';

describe('useRouteHeadingFocus', () => {
  let navigate;
  let shownCards;

  // Keeps the navigate function of the router for the tests, and holds the focused element
  const Page = ({ heading }) => {
    navigate = useNavigate();
    return <h1 tabIndex={-1}>{heading}</h1>;
  };

  const ListPage = () => (
    <>
      <Page heading={LIST_HEADING} />
      {shownCards.map(({ name, to }) => <Link key={name} to={to}>{name}</Link>)}
    </>
  );

  // A page still loading, whose heading the focus has to wait for
  const NoHeadingPage = () => {
    navigate = useNavigate();
    return null;
  };

  const Main = () => {
    const mainRef = useRef(null);

    useRouteHeadingFocus({ containerRef: mainRef });

    return (
      <main ref={mainRef}>
        <Routes>
          <Route path={HOME_PATHNAME} element={<Navigate to={PLUGINS_PATHNAME} replace />} />
          <Route path={PLUGINS_PATHNAME} element={<ListPage />} />
          <Route path="/plugin/:id" element={<Page heading={DETAILS_HEADING} />} />
          <Route path={EMPTY_PATHNAME} element={<NoHeadingPage />} />
        </Routes>
      </main>
    );
  };

  const renderAt = url => render(
    <MemoryRouter initialEntries={[url]}>
      <Main />
    </MemoryRouter>
  );

  const goTo = to => act(async () => {
    await navigate(to);
  });

  const focusedHeading = () => document.activeElement.textContent;

  beforeEach(() => {
    shownCards = [
      { name: OTHER_CARD_NAME, to: OTHER_PATHNAME },
      { name: OPENED_CARD_NAME, to: OPENED_PATHNAME }
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('leaves the focus of the browser on the first page', () => {
    renderAt(PLUGINS_PATHNAME);

    expect(document.activeElement).toBe(document.body);
  });

  it('leaves the focus of the browser after the redirect of the first address', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { name: LIST_HEADING })).toBeDefined();
    expect(document.activeElement).toBe(document.body);
  });

  it('focuses the heading of the page a link opens, which may scroll to it', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    renderAt(PLUGINS_PATHNAME);

    await goTo(OPENED_PATHNAME);

    expect(focusedHeading()).toBe(DETAILS_HEADING);
    expect(focus).toHaveBeenCalledWith({ preventScroll: false });
  });

  it('focuses the heading after a redirect that follows a link', async () => {
    renderAt(OPENED_PATHNAME);

    await goTo('/');

    expect(await screen.findByRole('heading', { name: LIST_HEADING })).toBe(document.activeElement);
  });

  it('focuses the heading when going back to a plugin, and keeps the restored place', async () => {
    renderAt(OPENED_PATHNAME);
    await goTo(PLUGINS_PATHNAME);
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');

    await goTo(-1);

    expect(focusedHeading()).toBe(DETAILS_HEADING);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('focuses the heading when going forward to a plugin', async () => {
    renderAt(PLUGINS_PATHNAME);
    await goTo(OPENED_PATHNAME);
    await goTo(-1);

    await goTo(1);

    expect(focusedHeading()).toBe(DETAILS_HEADING);
  });

  describe('back to the list from a plugin', () => {
    it('focuses the link of the opened card, and keeps the restored place', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo(OPENED_PATHNAME);
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');

      await goTo(-1);

      expect(document.activeElement).toBe(screen.getByRole('link', { name: OPENED_CARD_NAME }));
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it.each([
      ['another page', '/plugins?page=3'],
      ['a filtered list', '/plugins?brand=MDA&page=2']
    ])('focuses the card opened from %s', async (listName, url) => {
      renderAt(url);
      await goTo(OPENED_PATHNAME);

      await goTo(-1);

      expect(document.activeElement).toBe(screen.getByRole('link', { name: OPENED_CARD_NAME }));
    });

    it('focuses the card opened from a page reached by the query string', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo('/plugins?page=2');
      await goTo(OPENED_PATHNAME);

      await goTo(-1);

      expect(document.activeElement).toBe(screen.getByRole('link', { name: OPENED_CARD_NAME }));
    });

    it('focuses the last card opened from the same place', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo(OTHER_PATHNAME);
      await goTo(-1);
      await goTo(OPENED_PATHNAME);

      await goTo(-1);

      expect(document.activeElement).toBe(screen.getByRole('link', { name: OPENED_CARD_NAME }));
    });

    it('focuses the card after a plugin opened from the plugin', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo(OPENED_PATHNAME);
      await goTo(OTHER_PATHNAME);
      await goTo(-1);

      await goTo(-1);

      expect(document.activeElement).toBe(screen.getByRole('link', { name: OPENED_CARD_NAME }));
    });

    it('falls back to the heading when the card is no longer in the list', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo(OPENED_PATHNAME);
      shownCards = shownCards.filter(({ name }) => name !== OPENED_CARD_NAME);

      await goTo(-1);

      expect(focusedHeading()).toBe(LIST_HEADING);
    });

    it('focuses the card again after going forward to the plugin and back', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo(OPENED_PATHNAME);
      await goTo(-1);
      await goTo(1);

      await goTo(-1);

      expect(document.activeElement).toBe(screen.getByRole('link', { name: OPENED_CARD_NAME }));
    });

    it('focuses the heading after a jump of two entries', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo(OPENED_PATHNAME);
      await goTo(OTHER_PATHNAME);

      await goTo(-2);

      expect(focusedHeading()).toBe(LIST_HEADING);
    });

    it('stops following the card once it has left the list', async () => {
      renderAt(PLUGINS_PATHNAME);
      await goTo(OPENED_PATHNAME);
      await goTo(-1);
      const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');

      await goTo(EMPTY_PATHNAME);

      expect(disconnect).toHaveBeenCalledOnce();
    });

    it('stops following the card when it unmounts', async () => {
      const { unmount } = renderAt(PLUGINS_PATHNAME);
      await goTo(OPENED_PATHNAME);
      await goTo(-1);
      const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');

      unmount();

      expect(disconnect).toHaveBeenCalledOnce();
    });
  });

  it('focuses the heading when a link goes back to the list', async () => {
    renderAt(PLUGINS_PATHNAME);
    await goTo(OPENED_PATHNAME);

    await goTo(PLUGINS_PATHNAME);

    expect(focusedHeading()).toBe(LIST_HEADING);
  });

  it('focuses the heading when going forward to the list, which opened nothing', async () => {
    renderAt(OPENED_PATHNAME);
    await goTo(PLUGINS_PATHNAME);
    await goTo(-1);

    await goTo(1);

    expect(focusedHeading()).toBe(LIST_HEADING);
  });

  it('focuses the heading when going forward to a list that opened a plugin', async () => {
    renderAt(OTHER_PATHNAME);
    await goTo(PLUGINS_PATHNAME);
    await goTo(OPENED_PATHNAME);
    await goTo(-1);
    await goTo(-1);

    await goTo(1);

    expect(focusedHeading()).toBe(LIST_HEADING);
  });

  it('focuses the heading after a tab reloaded on a plugin, which forgot the card', async () => {
    render(
      <MemoryRouter initialEntries={[PLUGINS_PATHNAME, OPENED_PATHNAME]} initialIndex={1}>
        <Main />
      </MemoryRouter>
    );

    await goTo(-1);

    expect(focusedHeading()).toBe(LIST_HEADING);
  });

  it('moves nothing when only the query string changes', async () => {
    renderAt(PLUGINS_PATHNAME);

    await goTo('/plugins?page=2');

    expect(document.activeElement).toBe(document.body);
  });

  it('stops following the heading of a page once it has left it', async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    renderAt(PLUGINS_PATHNAME);
    await goTo(EMPTY_PATHNAME);
    expect(disconnect).not.toHaveBeenCalled();

    await goTo(PLUGINS_PATHNAME);

    expect(disconnect).toHaveBeenCalledOnce();
    expect(focusedHeading()).toBe(LIST_HEADING);
  });

  it('stops following the heading when it unmounts', async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const { unmount } = renderAt(PLUGINS_PATHNAME);
    await goTo(EMPTY_PATHNAME);

    unmount();

    expect(disconnect).toHaveBeenCalledOnce();
  });
});
