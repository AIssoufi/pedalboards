# 0006. Build and test the frontend with Vite and Vitest

- Date: 2026-10-20
- Status: Accepted

## Context

- The frontend ran on Create React App 2.1.1 (`react-scripts`): webpack 4, Babel 7, Jest 23 and
  `webpack-dev-server` 3. Create React App has been deprecated since February 2025.
- On Node.js 24, the version that [0001](0001-pnpm-workspaces-and-node-24.md) pins:
  - the development server did not start (`Error: No such module: http_parser`): its
    `http-deceiver` calls `process.binding('http_parser')`, which Node.js removed;
  - the build needed `NODE_OPTIONS=--openssl-legacy-provider`, since webpack 4 hashes with MD4,
    and Dart Sass installed under the `node-sass` name
    ([0003](0003-dart-sass-in-place-of-node-sass.md));
  - the absolute imports (`import { Env } from 'utils'`) relied on the `NODE_PATH=src/` of a
    `.env` file, which needed `extendNodePath: false` in the pnpm workspace.
- `react-scripts` was a production dependency of the frontend, which reached 223 advisories, all
  of them through its production dependencies.
- Cloudflare Pages publishes the frontend from `pedalboards-frontend/build`
  ([0005](0005-cloudflare-pages-and-d1-worker.md)).

## Decision

- Vite 8 and `@vitejs/plugin-react` 6 serve, build and preview the frontend (`pnpm dev`,
  `pnpm build`, `pnpm preview`):
  - `index.html` moves from `public/` to the root of the app and loads `src/index.jsx` as a
    module;
  - `vite.config.mjs` keeps port 3001, with `strictPort` so that the server never moves to 3002,
    the port of the CMS, and the `build` folder, so the Pages project needs no change;
  - the config file is an ES module by its `.mjs` extension: `"type": "module"` in `package.json`
    would also make an ES module of `.eslintrc.js`, written with `module.exports`, which would
    then fail to load.
- Vitest 5 runs the tests (`pnpm test`) in jsdom 30, with the globals that Jest gave (`describe`,
  `it`, `expect`, and `vi` in place of `jest`), and with the `vmThreads` pool, which creates
  jsdom once per worker instead of once per test file.
- The tests stay as they are, without Testing Library. Only what Vitest needs changes:
  - `vi` replaces `jest`;
  - the debounce test fakes `Date` along with the timers, as Vitest does;
  - the tests that render the whole app answer its `fetch` calls, since Vitest fails a run on a
    rejection that no test handles, which Jest 23 ignored;
  - the header test sets the CMS address with `vi.stubEnv`;
  - three test files that hold JSX take the `.jsx` extension, the only one where Vite reads JSX.
  Testing Library comes with React 19 ([#34](https://github.com/AIssoufi/pedalboards/issues/34)),
  which removes `ReactDOM.render` and rewrites these tests anyway.
- The environment variables take the `VITE_` prefix that Vite exposes: `REACT_APP_CORE_SERVICE`
  and `REACT_APP_BACKEND` become `VITE_CORE_SERVICE` and `VITE_BACKEND`, read through
  `import.meta.env`, with the same values in `.env.development`, `.env.production` and
  `.env.test`. The variable of the Pages preview deployments takes the new name too.
- The imports of `src/` become relative (`import { Env } from '../../utils'`), and the `.env`
  file that set `NODE_PATH` is deleted.
- React and React DOM move from 16.8.6 to 16.14.0, the last 16.x release: the Fast Refresh of
  `@vitejs/plugin-react` needs React 16.9 or later.
- `packageExtensions` in `pnpm-workspace.yaml` declares the peer dependencies that two packages
  leave out: `react-redux` 7 imports `react-dom`, and `react-tippy` 1 imports `react` and
  `react-dom`. Without them, pnpm resolved these imports to the hoisted React 16.8.6 of the CMS,
  and the bundle held two copies of React (474 kB of JavaScript instead of 358 kB).
- The pull request removes:
  - `react-scripts` and its `eject` script;
  - `src/serviceWorker.js`, which the app only unregistered;
  - the `node-sass` alias: the frontend installs `sass` under its own name;
  - the OpenSSL flag;
  - the `homepage`, `eslintConfig` and `browserslist` fields of `package.json`.
- The CSS is no longer autoprefixed. Autoprefixer 9, with the 2019 browser list of the app, added
  121 vendor prefixes, such as `-webkit-box` and `-webkit-transform`. They only serve browsers
  older than Safari 9, and every browser that Vite targets supports the unprefixed properties.
- `tools/dev-server-check` starts the dev server on a free port, checks that the page answers
  with HTML and each of its scripts with JavaScript, then stops it. The Frontend job of the CI runs
  it after the build, along with the tests of its helpers. The CMS can turn it on with
  `dev-server-check: true` in the CI matrix once it runs on Vite
  ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).
- Made in the pull request of issue [#33](https://github.com/AIssoufi/pedalboards/issues/33).

## Alternatives considered

- **Keep Create React App, at version 5 or through craco**: `react-scripts` 5 runs webpack 5,
  which needs neither the OpenSSL flag nor `node-sass`, but it is deprecated too, and it keeps
  Jest 27, `webpack-dev-server` 4 and most of the advisories.
- **Aliases in place of relative imports** (`resolve.alias`): the `src/redux` folder has the name
  of the `redux` package, so a `redux` alias would hide the package. A prefix such as `@/` would
  change every import anyway, with an alias to keep in step in Vite, Vitest and ESLint.
- **Jest next to Vite**: two transforms of the same code to configure and keep in step, where
  Vitest reuses the Vite configuration.
- **Testing Library now**: rewrites every test while the app still runs React 16, before #34
  rewrites them again for React 19.
- **`resolve.dedupe` for React**: puts one copy of React in the bundle, but leaves the pnpm graph
  wrong, so other tools could still load two copies. `packageExtensions` fixes the graph itself.
- **Autoprefixer or Lightning CSS in the build**: one more tool, for prefixes that no target
  browser needs.
- **The default pool of Vitest**: it creates jsdom for each test file, and the run took about 6 s
  instead of 1.5 s.

## Consequences

| Figure | Before (`c80ae2c3`) | After |
| --- | --- | --- |
| Development server on Node.js 24 | fails (`No such module: http_parser`) | starts, checked in the CI |
| Frontend build, median of 3 | 3.36 s | 0.48 s |
| JavaScript that the page loads, raw / gzipped | 370,400 B / 114,750 B (3 files) | 358,485 B / 112,988 B (1 file) |
| Service worker files in the build | 1,634 B (2 files) | none |
| CSS, raw / gzipped | 23,380 B / 3,743 B (2 files) | 20,431 B / 3,244 B (1 file) |
| Tests, all passing | 182 (Jest 23) | 191 (Vitest 5): the same 182, and 9 for `Env.get` |
| Test run, median of 3 | 1.31 s | 0.96 s |
| Direct dependencies of the frontend | 22 (17 + 5 dev) | 25 (15 + 10 dev) |
| Packages installed in the workspace | 1,681 | 1,588 |
| Install after deleting `node_modules`, median of 3 | 2.02 s | 2.23 s |
| Frontend advisories, critical / high / moderate / low | 27 / 103 / 69 / 24 | 2 / 26 / 14 / 3 |
| Frontend advisories of the production dependencies | 223 | 12 (8 high, 4 moderate) |
| Workspace advisories, critical / high / moderate / low | 27 / 103 / 69 / 24 | 27 / 103 / 69 / 24 |

- Measured on an Apple M3 (8 cores), with Node.js 24.22.0 and pnpm 12.14.0, in a copy of each
  commit extracted with `git archive`. The tests ran with `--maxWorkers=2`, the sizes are those of
  `wc -c` and `gzip -c`, and the advisories are those of `pnpm audit`, counted per app by the
  first package of their paths.
- The test runs of both commits were timed again, one after the other, once the tests of
  `Env.get` were added. They vary with the load of the machine: an earlier measure gave 1.22 s
  before and 1.48 s after, for the same 182 tests.
- The advisories of the workspace do not change: the CMS still installs `react-scripts` 2, which
  reaches every advisory that the frontend no longer does.
- The 12 production advisories of the frontend come from `lodash`, `recompose`,
  `react-router-dom` 4 and `react-redux`. The other 33 come from its development dependencies:
  `eslint-config-airbnb` 17, its ESLint plugins and `redux-devtools`.
- The build no longer runs ESLint, which Create React App did with its `react-app` config.
  `.eslintrc.js` still extends `react-app`, which left with `react-scripts`: the lint scripts
  are [#28](https://github.com/AIssoufi/pedalboards/issues/28).
- React 16.14 prints deprecation warnings in the tests: `componentWillMount` and
  `componentWillReceiveProps` in React Router 4, and `React.createFactory` in
  `recompose`. They are left to the upgrade to React 19 (#34).
- `extendNodePath: false` stays for the `NODE_PATH` of the CMS until it leaves Create React App
  (#45).
