# 0007. Replace react-tippy and recompose with in-house code

- Date: 2026-10-20
- Status: Accepted

## Context

- The frontend moves to React 19 ([#34](https://github.com/AIssoufi/pedalboards/issues/34)).
  Two of its dependencies call APIs that React 19 removes:
  - `react-tippy` 1.2.3, which shows the tooltips of the plugin cards and of the search form,
    renders the content of each bubble with `ReactDOM.render` or
    `ReactDOM.unstable_renderSubtreeIntoContainer`, and removes it with
    `ReactDOM.unmountComponentAtNode`. Its last release, 1.4.0 from May 2020, still calls
    `ReactDOM.render` and `unmountComponentAtNode`;
  - `recompose` 0.30.0, used by the `withLoader` higher-order component only, builds its
    components with `React.createFactory`. Its author stopped maintaining it in October 2018 in
    favor of Hooks, and its repository is archived.
- `react-tippy` puts its listeners and its `aria-describedby` on the `div` that wraps the
  trigger, not on the button or the link inside. Focus does not bubble, so a keyboard user who
  focuses the search button sees no tooltip, and a screen reader does not read the bubble as the
  description of the button.
- The CMS still runs React 16 on Create React App, with `react-tippy` for the tooltips of its
  plugin form ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).

## Decision

- A `Tooltip` component in `pedalboards-frontend/src/components/tooltip` replaces `react-tippy`
  in the frontend:
  - it keeps the look of the bubbles: dark gray `#333`, white text, rounded corners, and the same
    fade and 10 pixel shift, with no motion when the system asks to reduce it;
  - it shows the bubble while the pointer is over the trigger or the focus is inside it, and
    hides it on Escape;
  - the bubble has `role="tooltip"` and an id from `useId`, which the trigger gets in its
    `aria-describedby`, next to any description it already had;
  - the bubble is rendered in a portal at the end of the body, with a fixed position measured
    while it shows and again on scroll and resize. It goes to the other side of its trigger when
    its own side has no room, and stays 10 pixels inside the viewport, so it is not clipped on a
    390 pixel wide phone;
  - its position logic lives in pure helpers (`utils.js`) and two hooks (`useTooltipOpen`,
    `useBubblePosition`), each with its tests.
- `withLoader` becomes a plain higher-order component of a few lines, with the same behavior: it
  renders the loader while `isLoading` is truthy, then the wrapped component with all its props.
- The CMS keeps `react-tippy` on React 16, so `packageExtensions` in `pnpm-workspace.yaml` still
  declares its React peer dependencies, now limited to React 15 and 16. The entry of
  `react-redux` 7 that [0006](0006-vite-and-vitest.md) added goes: `react-redux` 9 no longer
  imports `react-dom`, and declares `react` among its peer dependencies.
- Made in the pull request of issue [#34](https://github.com/AIssoufi/pedalboards/issues/34).

## Alternatives considered

- **`react-tippy` 1.4.0**: still calls `ReactDOM.render` and `unmountComponentAtNode`.
- **`@tippyjs/react` 4 with Tippy.js 6**: no release since November 2021, and three packages with
  Popper, for tooltips with two placements.
- **Floating UI (`@floating-ui/react`)**: maintained and accessible, but six packages with its
  dependencies for what a helper file and a hook, 177 lines with their comments, do here: two
  placements, a flip and a clamp to the viewport.
- **`react-recompose`**, a fork of `recompose`: its last release, in March 2023, declares React
  18 at most, for one `branch` call that a plain function replaces.

## Consequences

| Figure | Before (`cf297411`) | After |
| --- | --- | --- |
| Frontend JavaScript, raw / gzipped | 358,515 B / 113,368 B | 392,322 B / 127,177 B |
| Frontend CSS, raw / gzipped | 20,431 B / 3,217 B | 8,125 B / 2,083 B |
| Frontend direct dependencies | 25 (15 + 10 dev) | 24 (13 + 11 dev) |
| Tooltip shown when its trigger gets the focus | no | yes |

- The figures compare the base with the whole pull request, which also moves the frontend to
  React 19. React DOM 19 is larger than React DOM 16.14: measured with React 18.3 at each step,
  the tooltip alone takes the JavaScript from 362.09 kB to 313.11 kB and the CSS from 20.43 kB to
  8.12 kB, as Vite reports them, since `tippy.css` and Popper.js leave the bundle.
- The tooltip is now code of the project to maintain, with 75 tests.
- `react-tippy` leaves the workspace when the CMS moves to Vite and React 19
  ([#45](https://github.com/AIssoufi/pedalboards/issues/45)), along with its
  `packageExtensions`.
