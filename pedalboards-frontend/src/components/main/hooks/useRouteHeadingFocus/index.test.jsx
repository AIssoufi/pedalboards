// Dependencies
import { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import {
  MemoryRouter, Navigate, Route, Routes, useNavigate
} from 'react-router';

// Hooks
import useRouteHeadingFocus from './index';

const LIST_HEADING = 'Plugins';
const DETAILS_HEADING = 'abGate';

describe('useRouteHeadingFocus', () => {
  let navigate;

  // Keeps the navigate function of the router for the tests, and holds the focused element
  const Page = ({ heading }) => {
    navigate = useNavigate();
    return <h1 tabIndex={-1}>{heading}</h1>;
  };

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
          <Route path="/" element={<Navigate to="/plugins" replace />} />
          <Route path="/plugins" element={<Page heading={LIST_HEADING} />} />
          <Route path="/plugin/:id" element={<Page heading={DETAILS_HEADING} />} />
          <Route path="/empty" element={<NoHeadingPage />} />
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('leaves the focus of the browser on the first page', () => {
    renderAt('/plugins');

    expect(document.activeElement).toBe(document.body);
  });

  it('leaves the focus of the browser after the redirect of the first address', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { name: LIST_HEADING })).toBeDefined();
    expect(document.activeElement).toBe(document.body);
  });

  it('focuses the heading of the page a link opens, which may scroll to it', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    renderAt('/plugins');

    await goTo('/plugin/abgate');

    expect(focusedHeading()).toBe(DETAILS_HEADING);
    expect(focus).toHaveBeenCalledWith({ preventScroll: false });
  });

  it('focuses the heading after a redirect that follows a link', async () => {
    renderAt('/plugin/abgate');

    await goTo('/');

    expect(await screen.findByRole('heading', { name: LIST_HEADING })).toBe(document.activeElement);
  });

  it('focuses the heading when going back, and keeps the restored place', async () => {
    renderAt('/plugins');
    await goTo('/plugin/abgate');
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');

    await goTo(-1);

    expect(focusedHeading()).toBe(LIST_HEADING);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('moves nothing when only the query string changes', async () => {
    renderAt('/plugins');

    await goTo('/plugins?page=2');

    expect(document.activeElement).toBe(document.body);
  });

  it('stops following the heading of a page once it has left it', async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    renderAt('/plugins');
    await goTo('/empty');
    expect(disconnect).not.toHaveBeenCalled();

    await goTo('/plugins');

    expect(disconnect).toHaveBeenCalledOnce();
    expect(focusedHeading()).toBe(LIST_HEADING);
  });

  it('stops following the heading when it unmounts', async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const { unmount } = renderAt('/plugins');
    await goTo('/empty');

    unmount();

    expect(disconnect).toHaveBeenCalledOnce();
  });
});
