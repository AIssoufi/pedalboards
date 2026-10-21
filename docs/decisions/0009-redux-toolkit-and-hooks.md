# 0009. Run the frontend store on Redux Toolkit, with hooks and no prop-types

- Date: 2026-10-21
- Status: Accepted

## Context

- The store of the plugins page was written by hand on Redux 4: action types in
  `redux/constants`, action creators and two thunks in `redux/actions`, a reducer and
  `reselect` selectors, `createStore` with `redux-thunk`, and `redux-logger` loaded in
  development. The page read the store through `connect`, and the grid and the details were
  wrapped in the `withLoader` higher-order component.
- A failed request looked like an answer. The request helper parsed every response, whatever
  its status, and its `catch` logged the error and resolved with `undefined`. The thunks then
  dispatched that `undefined` as a list of plugins, and the store had no error state: neither
  page could tell a failed request from an empty answer.
- The search field was uncontrolled and empty on load, so a filter link, the back button or a
  shared link showed a filtered list under an empty field. Its `onChange` built a new lodash
  `debounce` on each render, the only use of `lodash`, whose advisories were the last ones of
  the frontend.
- `prop-types` checked the props in development only, and React 19 no longer reads the
  `propTypes` of function components.
- The ids of the plugins went into the URLs of the API unencoded.

## Decision

In [#36](https://github.com/AIssoufi/pedalboards/issues/36):

- The store is a `createSlice` of the plugins, with a `createAsyncThunk` that loads one page,
  filtered or not, built by `configureStore`. The slice keeps a load status and the error of the
  last request, ignores the answer of a request that a newer one replaced, and an aborted
  request leaves no error. `createSelector` gives the page its plugins, page count, loading and
  failure flags. The Redux DevTools stay on in development only.
- The plugins page reads the store with `useSelector` and `useDispatch`, aborts the request of
  a search it leaves, and shows an alert in place of the grid when the request fails. The
  details page shows an alert when its plugin does not load.
- The request helper rejects with a `RequestError`, holding the status when there is one, on a
  network failure, a status outside 200 to 299 or a body that is not JSON. The service encodes
  the id of a plugin with `encodeURIComponent`. The test setup stubs `fetch` with a function
  that rejects, so that no test reaches the network.
- The search field and its select are controlled, filled from the filter of the URL and updated
  when it changes. A `useDebouncedCallback` hook keeps one 900 ms debounce across renders.
  `lodash` leaves the dependencies.
- The grid and the details render the loader themselves from an `isLoading` prop, and the
  `hoc` folder is removed.
- The props are typed with JSDoc typedefs, and `prop-types` leaves the dependencies, with the
  `react/prop-types` lint rule.
- `redux`, `redux-thunk`, `reselect` and `redux-logger` give way to `@reduxjs/toolkit`, which
  holds the first three. The check of the bundle now looks for two development-only messages of
  Redux Toolkit, those of its mutation and serializability checks, in place of `redux-logger`.

## Alternatives considered

- **Keep Redux 4 and fix the reducer by hand**: the error state, the race of two searches and
  the abort would each need new action types, creators and cases, the boilerplate that Redux
  Toolkit writes. The Redux team now documents Redux Toolkit as the way to write Redux.
  Rejected.
- **Drop Redux for the local state of the page**: the store holds one list read by one page,
  and `useState` with an effect would do. Rejected: the slice keeps the race and the abort of
  the searches out of the page, and tests them apart from it.
- **RTK Query**: it would cache the pages and the plugins, but it replaces the service and the
  request helper, and the app has two reads. Rejected for now.
- **`redux-logger` with Redux Toolkit**: the DevTools show each action and the state, in
  development only, without a middleware in the bundle. Rejected.
- **A debounce from `lodash.debounce` or another package**: the hook is under fifty lines and has
  its own tests, while a package would bring back a dependency for one function. Rejected.
- **TypeScript in place of JSDoc**: a migration of every file, out of the scope of this
  ticket. The typedefs carry the same comments as the prop types did.

## Consequences

| Figure | Before (`f8e72b82`) | After |
| --- | --- | --- |
| Frontend tests, all passing | 310 | 418 |
| Frontend test run, median of 3 | 1.0 s | 1.1 s |
| Frontend build, median of 3 | 0.3 s | 0.3 s |
| Frontend JS that the page loads, raw / gzipped | 399,366 B / 130,200 B | 340,244 B / 109,544 B |
| Frontend direct dependencies | 27 | 22 |
| Install after deleting `node_modules`, median of 3 | 1.7 s | 1.8 s |
| Frontend audit advisories, critical / high / moderate / low | 0 / 3 / 3 / 0 | 0 / 0 / 0 / 0 |
| Workspace audit advisories, critical / high / moderate / low | 27 / 99 / 69 / 24 | 27 / 99 / 69 / 24 |

Measured as in the [evolution](../evolution.md): base and branch in turn, three runs each, on an
Apple M3 with Node.js 24.22.0 and pnpm 12.14.0.

- The script that the page loads loses 59,122 B, 20,656 B gzipped, and the frontend has no
  audit advisory left, since those of `lodash` are gone. The workspace keeps those of the CMS.
- `prop-types` stays in the bundle, as a dependency of `@fortawesome/react-fontawesome`.
- A failed API request now shows an alert on both pages, and the tests cover a rejected `fetch`
  and an error status on each of them.
- A search by URL fills the form, and several keystrokes run one search.
- The store no longer logs its actions in the console during development: the Redux DevTools
  show them.
- Redux Toolkit adds `immer` to the bundle, which the reducers of the slice use.
- The props are still not checked when the app runs, as since React 19: a prop of the wrong type
  shows no warning.
