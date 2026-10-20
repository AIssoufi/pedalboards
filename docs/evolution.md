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
- **the CMS**: not deployed. Its write routes stay in the repository, and
  [#53](https://github.com/AIssoufi/pedalboards/issues/53) gives them a local environment.

The MongoDB service is gone. The core service now tests its routes with Vitest in the Workers
runtime, against a local D1, and the CI checks that the deployed bundle holds no write route.

| Figure | Before (`04e4ed89`) | After |
| --- | --- | --- |
| Live site | none | `pedalboards.issoufi.fr` |
| Core service tests, all passing | 22 | 77 |
| Core service test run, median of 3 | 0.24 s | 2.45 s |
| Core service direct dependencies | 5 + 3 dev | 1 + 3 dev |
| Core service packages, production / all | 90 / 372 | 73 / 341 |
| Production advisories of the core service | 30 | 0 |
| Audit advisories of the workspace, critical / high / moderate / low | 28 / 112 / 72 / 25 | 27 / 103 / 69 / 24 |
| Install after deleting `node_modules` | 1.93 s | 1.95 s |
| Worker bundle, raw / gzipped | none | 1,167.57 KiB / 300.28 KiB |

Decision: [0005. Deploy the frontend on Cloudflare Pages and a read-only API Worker on D1](decisions/0005-cloudflare-pages-and-d1-worker.md)
