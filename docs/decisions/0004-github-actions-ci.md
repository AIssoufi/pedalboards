# 0004. Install, test and build the three apps in a GitHub Actions CI

- Date: 2026-10-20
- Status: Accepted

## Context

- From 2018 to 2026, the repository had no continuous integration: nothing ran the tests or the
  builds automatically, on a pull request or elsewhere.
- On the current Node.js LTS (24), none of the three apps passed: the frontend and the CMS did not
  install (`node-sass`, see [0003](0003-dart-sass-in-place-of-node-sass.md)), their webpack 4 build
  failed with `ERR_OSSL_EVP_UNSUPPORTED` under OpenSSL 3, the CMS run of Jest hung on a crashed
  worker, and the frontend tests failed.
- The core service has no test runner, so nothing checked that it even started.

## Decision

- A GitHub Actions workflow, `.github/workflows/ci.yml`, runs on every pull request to `master`
  and every push to `master`, on Node.js 24, with one named job per app so that each one can be a
  required check:

  | Job | Steps |
  | --- | --- |
  | Frontend | install, `CI=true npm test`, `CI=true npm run build` |
  | CMS | install, `CI=true npm test`, `CI=true npm run build` |
  | Core service | install, `npm run smoke` |

- `npm run smoke` starts the API on a free port, waits until it answers with the CORS header of
  the app (no MongoDB needed), then stops it.
- To make the jobs pass on Node.js 24, the same pull request sets
  `NODE_OPTIONS=--openssl-legacy-provider` on the `start` and `build` scripts of the React apps,
  gives their tests a `.env.test` with a local core service URL, renders the frontend pages with a
  Redux store and a router in their tests, and removes an unused state of the CMS that `CI=true`
  turns into a build error.
- A new push to a pull request cancels its previous run; each push to `master` gets its own run.
- Made in pull request [#39](https://github.com/AIssoufi/pedalboards/pull/39), for issue
  [#24](https://github.com/AIssoufi/pedalboards/issues/24). The install steps moved from `npm ci`
  to pnpm in [0001](0001-pnpm-workspaces-and-node-24.md).

## Alternatives considered

- **Travis CI or CircleCI**: a second service, with its own account and settings, for a repository
  already hosted on GitHub, where Actions needs only a file in the repository.
- **One job for the three apps**: shorter to write, but the apps would run one after the other,
  and a failure would not say which app broke or let each app be a required check.
- **A unit test runner for the core service first**: a larger change; the smoke check catches a
  service that no longer starts until the service gets real tests.

## Consequences

| Figure | Before | After |
| --- | --- | --- |
| Checks on a pull request | none | 3 jobs |
| Tests run on a pull request | 0 | 9 (7 frontend + 2 CMS), plus the smoke check |
| CI run, whole workflow | none | 39 s |
| CI jobs, frontend / CMS / core service | none | 30 s / 37 s / 14 s |

- The durations come from the last run of the pull request, with the npm cache
  ([run 39382009955](https://github.com/AIssoufi/pedalboards/actions/runs/39382009955)), read with
  `gh run view --json createdAt,updatedAt,jobs`.
- A throwaway commit with a failing frontend test, an unused CMS variable and a core service that
  throws at startup turned each job red at the expected step
  ([run 39381906266](https://github.com/AIssoufi/pedalboards/actions/runs/39381906266)).
- The CI only tests what the apps test: 9 tests, one per test file, and none for the core service.
- The OpenSSL flag and the `.env.test` files stay as long as the React apps run on Create React
  App ([#33](https://github.com/AIssoufi/pedalboards/issues/33) for the frontend,
  [#45](https://github.com/AIssoufi/pedalboards/issues/45) for the CMS).
- The development servers of the frontend and the CMS still do not start on Node.js 24, which the
  CI does not check (see [0001](0001-pnpm-workspaces-and-node-24.md)).
