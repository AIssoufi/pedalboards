# Evolution

The tools and the architecture of the project over time, oldest first. Each step links the
decision record that explains it.

The figures of the eras before pnpm are counted from the files of the commit named in each table:
the `package.json` and npm lockfiles, the test files, and `npm audit --package-lock-only` run on
2026-10-20 on every era with the same advisory database. The advisories are the distinct GitHub
advisories of the four npm lockfiles. No build or test time is given for these eras: their apps
do not install on the Node.js versions in use today (`node-sass` 4 has no build for them), and
nothing recorded a time when they ran.

## 2018: three apps on Create React App 2, Express and MongoDB

The project starts on 2018-11-05 as one React app, split on 2018-11-20 into three folders:
- `pedalboards-frontend` and `pedalboards-cms`: Create React App 2.1.1, React 16.6,
  React Router 4, styles in Sass compiled by `node-sass` 4;
- `pedalboards-core-service`: a REST API on Express 4 and the MongoDB driver 3, run with
  `nodemon` in development;
- the root `package.json` installs and starts the three apps with `concurrently`.

Each folder holds both an npm and a Yarn lockfile. In December 2018, Dockerfiles based on
`node:11.0.0` package each app, and the API moves from a local MongoDB to a hosted one. The apps
are deployed on Heroku, and nothing tests or builds them automatically.

| Figure | End of the era (`3a002239`, 2018-12-17) |
| --- | --- |
| Direct dependencies (root + frontend + CMS + core service) | 30 (1 + 11 + 11 + 7) |
| Lockfiles | 4 npm files of 39,271 lines, and 4 Yarn files of 20,887 lines |
| Packages in the npm lockfiles | 4,660 |
| Tests (frontend + CMS) | 9 (7 + 2), one per test file |
| Audit advisories, critical / high / moderate / low | 31 / 121 / 77 / 24 |
| CI | none |

## 2019: Redux in the frontend, then a pause

In June 2019, the frontend moves to React 16.8 and manages its state with Redux (`react-redux`,
`redux-thunk`, `reselect`) and higher-order components from `recompose`, its components are
regrouped into `components/` and `pages/`, and both React apps add the Airbnb ESLint config. The
Yarn lockfiles are deleted, so npm alone installs the apps. In December 2019, Dependabot bumps
`lodash` and `mixin-deep`, and the repository then gets no commit until October 2026.

| Figure | Before (`3a002239`, 2018-12-17) | After (`7e3f5272`, 2019-12-28) |
| --- | --- | --- |
| Direct dependencies | 30 | 45 (1 + 22 + 15 + 7) |
| Lockfiles | 8 files (4 npm, 4 Yarn), 60,158 lines | 4 npm files, 42,482 lines |
| Packages in the npm lockfiles | 4,660 | 5,031 |
| Tests (frontend + CMS) | 9 (7 + 2) | 9 (7 + 2) |
| Audit advisories, critical / high / moderate / low | 31 / 121 / 77 / 24 | 30 / 120 / 75 / 25 |

The next step came because, in 2026, the apps no longer installed on the current Node.js LTS, and
no CI would have said so.

## 2026: a CI on Node.js 24, with Dart Sass

The frontend and the CMS compile their styles with Dart Sass in place of `node-sass`, and a GitHub
Actions workflow installs, tests and builds the three apps on Node.js 24 for every pull request.
On the same day, the core service stops holding its database URL in its `start` script: it reads
it from the environment, documented in `.env.example`
([#23](https://github.com/AIssoufi/pedalboards/pull/23)).

| Figure | Before (`7e3f5272`) | After (`638b73b6`) |
| --- | --- | --- |
| `npm ci` of the frontend and the CMS on Node.js 24 | fails | passes |
| Checks on a pull request | none | 3 CI jobs |
| Tests run on a pull request | 0 | 9 (7 + 2), plus a start check of the core service |
| CI run, whole workflow | none | 39 s |
| Lockfiles | 4 npm files, 42,482 lines | 4 npm files, 41,965 lines |
| Packages in the npm lockfiles | 5,031 | 4,981 |
| Compiled CSS of the frontend and the CMS | reference | byte-identical |
| Audit advisories, critical / high / moderate / low | 30 / 120 / 75 / 25 | 30 / 118 / 73 / 25 |

Decisions:
- [0003. Compile the styles with Dart Sass in place of node-sass](decisions/0003-dart-sass-in-place-of-node-sass.md)
- [0004. Install, test and build the three apps in a GitHub Actions CI](decisions/0004-github-actions-ci.md)

## Since 2026: pnpm workspace on Node.js 24

The three apps (frontend, CMS, core service) share one pnpm workspace and one lockfile, on the
Node.js version of `.nvmrc`. Before, each app had its own npm lockfile, and the root scripts ran
npm in every folder through `concurrently`.

| Figure | Before (npm) | After (pnpm) |
| --- | --- | --- |
| Lockfiles | 4 files, 41,965 lines | 1 file, 14,794 lines |
| Packages installed | 4,629 (82 + 389 + 2,159 + 1,999) | 1,603 |
| Install after deleting `node_modules` | 12.59 s | 1.43 s |
| Tests (frontend + CMS), all passing | 9 (7 + 2) | 9 (7 + 2) |
| Test run, frontend / CMS | 1.84 s / 1.62 s | 1.22 s / 0.94 s |
| Build, frontend / CMS | 6.27 s / 5.00 s | 5.11 s / 3.54 s |
| Frontend JS, raw / gzipped | 367,596 B / 113,856 B | 367,706 B / 113,913 B |
| Frontend CSS, raw / gzipped | 23,322 B / 3,741 B | 23,334 B / 3,738 B |
| CMS JS, raw / gzipped | 259,258 B / 77,877 B | 259,258 B / 77,878 B |
| CMS CSS, raw / gzipped | 19,887 B / 3,067 B | 19,899 B / 3,063 B |
| Direct dependencies | 45 | 45 |
| Audit advisories, critical / high / moderate / low | 30 / 118 / 73 / 25 | 26 / 102 / 69 / 24 |
| CI run | 35 s | 35 s |
| CI install step, frontend / CMS / core service | 11 s / 8 s / 5 s | 3 s / 3 s / 3 s |

Decision: [0001. Move to pnpm workspaces and pin Node.js 24](decisions/0001-pnpm-workspaces-and-node-24.md)

## Since 2026: checked commit messages

Every commit follows Conventional Commits and names its ticket in a `Refs: PEDAL-<number>`
trailer: commitlint checks it in a `commit-msg` hook of husky and in the CI of each pull request,
which checks its title too, and a `prepare-commit-msg` hook adds the trailer on a ticket branch.
Before, the convention was a habit that nothing checked.

| Figure | Before | After |
| --- | --- | --- |
| Packages installed | 1,603 | 1,669 |
| Direct dependencies | 45 | 50 |
| Install after deleting `node_modules` | 1.93 s | 2.18 s |
| Empty commit (`git commit --allow-empty`) | 0.02 s | 0.35 s |
| Audit advisories, critical / high / moderate / low | 28 / 112 / 72 / 25 | 28 / 112 / 72 / 25 |
| Tests of the commit message tools | none | 115, all passing |
| CI workflow run | 35 s | 34 s |
| Commit messages workflow run, next to the CI workflow | none | 22 s |

Decision: [0002. Check the commit messages with commitlint and husky](decisions/0002-commit-message-checks.md)

## Since 2026: deployed on Cloudflare, with a read-only API on D1

The site moves from its Heroku apps, which answer `404`, to `pedalboards.issoufi.fr`. Its three
parts are hosted as follows:
- **the frontend**: a Cloudflare Pages project;
- **the API**: a Worker on the `/api/*` paths of the same domain, running the read routes of the
  core service on Express 5, on a D1 database seeded from `plugins.json`;
- **the CMS**: not deployed. Its write routes run in a local API only, on a local D1 and an R2
  bucket that wrangler simulates
  ([#53](https://github.com/AIssoufi/pedalboards/issues/53)).

The MongoDB service is gone. The core service now tests its routes with Vitest in the Workers
runtime, against a local D1, and the CI checks that the deployed bundle holds no write route.

| Figure | Before (`04e4ed89`) | After |
| --- | --- | --- |
| Live site | none | `pedalboards.issoufi.fr` |
| Core service tests, all passing | 22 | 81 |
| Core service test run, median of 3 | 0.24 s | 1.77 s |
| Core service direct dependencies | 5 + 3 dev | 1 + 3 dev |
| Core service packages, production / all | 90 / 372 | 73 / 341 |
| Production advisories of the core service | 30 | 0 |
| Audit advisories of the workspace, critical / high / moderate / low | 28 / 112 / 72 / 25 | 27 / 103 / 69 / 24 |
| Install after deleting `node_modules` | 1.93 s | 1.95 s |
| Worker bundle, raw / gzipped | none | 1,167.60 KiB / 300.29 KiB |

Decision: [0005. Deploy the frontend on Cloudflare Pages and a read-only API Worker on D1](decisions/0005-cloudflare-pages-and-d1-worker.md)

## Since 2026: the frontend on Vite and Vitest

The frontend leaves Create React App 2: Vite serves and builds it, and Vitest runs its tests in
jsdom. Its development server starts again on Node.js 24, and the CI checks that it serves the
app. The build no longer needs the OpenSSL flag, the `node-sass` alias or a `NODE_PATH`, and its
environment variables take the `VITE_` prefix. `.env.production` now names the address of the
API, so the Pages previews show the plugins. React moves from 16.8.6 to 16.14.0, which the Fast
Refresh of Vite needs, and `packageExtensions` in the pnpm workspace give `react-redux` and
`react-tippy` the React of the frontend, so that the bundle holds a single copy of React. The CMS
still runs on Create React App ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).

| Figure | Before (`c80ae2c3`) | After |
| --- | --- | --- |
| Frontend development server on Node.js 24 | fails | starts, checked in the CI |
| Frontend build, median of 3 | 3.36 s | 0.48 s |
| Frontend JS that the page loads, raw / gzipped | 370,400 B / 114,750 B | 358,515 B / 113,003 B |
| Frontend CSS, raw / gzipped | 23,380 B / 3,743 B | 20,431 B / 3,244 B |
| Frontend tests, all passing | 182 (Jest 23) | 191 (Vitest 5) |
| Frontend test run, median of 3 | 1.31 s | 0.96 s |
| Frontend direct dependencies | 22 | 25 |
| Packages installed | 1,681 | 1,588 |
| Install after deleting `node_modules` | 2.02 s | 2.23 s |
| Frontend audit advisories, critical / high / moderate / low | 27 / 103 / 69 / 24 | 2 / 26 / 14 / 3 |
| Workspace audit advisories, critical / high / moderate / low | 27 / 103 / 69 / 24 | 27 / 103 / 69 / 24 |

The advisories of the workspace stay the same because the CMS still installs `react-scripts` 2,
which reaches all those that the frontend left. The 21 advisories of the core service stay too,
all through `pedalboards-core-service>vitest>jsdom@15.1.1`: pnpm still resolves the optional
`jsdom` peer of Vitest with the jsdom 15.1.1 that `react-scripts` 2 brings into the workspace, so
they go when the CMS leaves Create React App
([#45](https://github.com/AIssoufi/pedalboards/issues/45)).

Decision: [0006. Build and test the frontend with Vite and Vitest](decisions/0006-vite-and-vitest.md)

## Since 2026: the frontend on React 19

The frontend moves from React 16.14 to React 19, and starts with `createRoot` in place of
`ReactDOM.render`. `react-redux` moves to 9, still on Redux 4
([#36](https://github.com/AIssoufi/pedalboards/issues/36) brings Redux 5), and React Router to
5.3, which keeps the API of React Router 4 but drops the legacy context that React 19 removes
(React Router 7 is [#35](https://github.com/AIssoufi/pedalboards/issues/35)). The tests render
with Testing Library. Two dependencies that call APIs React 19 removes leave the frontend:
`react-tippy`, replaced by a `Tooltip` component of the project that also shows on focus, and
`recompose`. The unused `redux-devtools`, whose peer dependencies stop at React 16, leaves too.
`react-fontawesome` moves to 0.2.6, which no longer relies on `defaultProps`. The tests and the
browser console print no React warning.

| Figure | Before (`cf297411`) | After |
| --- | --- | --- |
| React warnings in a frontend test run | 26 | 0 |
| React warnings in the browser console, plugins, search and details at two widths | 30 | 0 |
| Frontend tests, all passing | 191 | 280 |
| Frontend test run, median of 3 | 0.9 s | 0.9 s |
| Frontend build, median of 3 | 0.3 s | 0.3 s |
| Frontend JS that the page loads, raw / gzipped | 358,515 B / 113,368 B | 392,322 B / 127,177 B |
| Frontend CSS, raw / gzipped | 20,431 B / 3,217 B | 8,125 B / 2,083 B |
| Frontend direct dependencies | 25 | 24 |
| Install after deleting `node_modules`, median of 3 | 1.8 s | 1.8 s |
| Frontend audit advisories, critical / high / moderate / low | 2 / 26 / 14 / 3 | 2 / 21 / 13 / 3 |
| Workspace audit advisories, critical / high / moderate / low | 27 / 103 / 69 / 24 | 27 / 99 / 69 / 24 |
| Lighthouse of `/plugins` in the built frontend, performance / accessibility / best practices / SEO | 75 / 83 / 100 / 91 | 70 / 83 / 100 / 91 |

The base and the branch were measured in turn on an Apple M3 (8 cores), with Node.js 24.22.0 and
pnpm 12.14.0, three runs each: `node_modules` deleted before each install, and the build output
before each build. The JavaScript grows with React DOM 19, although the tooltip alone made
it smaller (see [0007](decisions/0007-in-house-tooltip-and-loader.md)). The performance score
follows: the first contentful paint goes from 2.7 s to 2.9 s in each run, and the largest one,
a plugin screenshot loaded from a remote host, varies between runs (5.3 to 5.6 s before, 5.5 to
7.3 s after), so the three scores of the branch are 70, 73 and 65. Apart from the ESLint
configuration and plugins of its development dependencies, the frontend now reaches only the 6
advisories of `lodash`: those of `recompose`, `react-router-dom` 4, `react-redux` 7 and
`redux-devtools` are gone.

Decision: [0007. Replace react-tippy and recompose with in-house code](decisions/0007-in-house-tooltip-and-loader.md)

## Since 2026: the frontend linted with ESLint 9

The frontend moves from an unused `.eslintrc.js`, built on the airbnb and Create React App
presets, to a flat `eslint.config.mjs` on ESLint 9, made of the recommended presets of ESLint,
React, React Hooks, jsx-a11y and `eslint-plugin-import-x`. `pnpm lint` exits 0 and runs in the
CI before the tests, with `import-x/no-cycle` as an error: the plugin grid now imports its card
from its own module rather than from the `components` barrel. The fixes follow the React
Compiler rules of React Hooks 7: the search form reads its fields from the event rather than a
ref, and the details page sets no state synchronously in its effect. The CMS keeps no lint until
it leaves Create React App ([#45](https://github.com/AIssoufi/pedalboards/issues/45)), whose
preflight check refuses ESLint 9.

| Figure | Before (`ec26dfff`) | After |
| --- | --- | --- |
| Frontend lint problems, errors / warnings | 99 (95 / 4) | 0 |
| `import/no-cycle` errors | 2 | 0 |
| Frontend lint run, median of 3 | 0.9 s | 1.1 s |
| Frontend tests, all passing | 287 | 303 |
| Frontend direct dependencies | 24 | 27 |
| Install after deleting `node_modules`, median of 3 | 1.7 s | 3.4 s |
| Frontend audit advisories, critical / high / moderate / low | 2 / 21 / 13 / 3 | 0 / 3 / 3 / 0 |
| Workspace audit advisories, critical / high / moderate / low | 27 / 99 / 69 / 24 | 27 / 99 / 69 / 24 |

The base and the branch were measured in turn on an Apple M3 (8 cores), with Node.js 24.22.0 and
pnpm 12.14.0. The lint of the base is `eslint --ext .js,.jsx src` with the ESLint 5.6.0 that the
frontend reached through the hoisted dependencies of the CMS, since it had no ESLint of its own:
most of its problems were `react/require-default-props`, the Vitest globals unknown to its
config, and a parsing error that stopped it from reading one test file. The lint of the branch
is `pnpm lint`, over `src`, `scripts` and the configuration files. The install takes longer with
the ESLint 9 plugins and their resolver, but the frontend no longer reaches the advisories of
the ESLint 5 tree: the 6 left are those of `lodash`, which
[#36](https://github.com/AIssoufi/pedalboards/issues/36) removes. The workspace keeps the same
advisories, those of the CMS.

Decision: [0008. Lint the frontend with ESLint 9 and its recommended presets](decisions/0008-eslint-flat-config.md)
