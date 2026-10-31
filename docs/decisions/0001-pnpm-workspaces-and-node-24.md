# 0001. Move to pnpm workspaces and pin Node.js 24

- Date: 2026-10-20
- Status: Accepted, amended by [0011](0011-node-26-lts.md) for the pinned Node.js version

## Context

- The repository holds three apps: the frontend and the CMS on Create React App 2, and the core
  service on Express. Each app had its own npm lockfile, and the root `package.json` had a fourth
  one for `concurrently`, which its `install` and `start` scripts used to run npm in every folder.
- npm installed a separate copy of every shared package in each app, and its hoisting let the core
  service import `body-parser` without declaring it.
- Only the CI workflow set the Node.js version (24): nothing told a developer which version to
  use. The three Dockerfiles still started from `node:11.0.0`, and nothing built or deployed them.

## Decision

- The three apps form one pnpm workspace (`pnpm-workspace.yaml`) with a single `pnpm-lock.yaml`,
  and the `packageManager` field of the root `package.json` pins pnpm 12.14.0. The lockfile comes
  from `pnpm import` of the npm lockfiles, so the packages keep versions that npm had resolved,
  but the three apps now share one version of a package where their ranges allow it: the core
  service runs Express 4.17.1 (4.16.4 before), the version the frontend tooling already used.
  Apart from pnpm itself, 9 package versions are in no npm lockfile, such as `sass` 1.105.2
  (1.105.1 before).
- The root scripts call `pnpm --filter` and `pnpm --workspace-root run --parallel --no-bail`
  instead of `concurrently`.
- `.nvmrc` pins Node.js 24, the `engines` field of every `package.json` requires it, and the CI
  reads `.nvmrc` and caches the pnpm store.
- No install script of the dependencies runs (`allowBuilds`), since none is needed, and
  `extendNodePath: false` keeps the `NODE_PATH=src/` of the Create React App apps.
- The core service declares `body-parser`, and the Dockerfiles and their `.dockerignore` files are
  removed.
- Made in pull request [#48](https://github.com/AIssoufi/pedalboards/pull/48), for issue
  [#32](https://github.com/AIssoufi/pedalboards/issues/32).

## Alternatives considered

- **npm workspaces**: one lockfile as well, but npm hoists every package to the root
  `node_modules`, so an app can still import a package it does not declare.
- **Yarn workspaces**: one lockfile as well, but Yarn 1 hoists like npm and only gets fixes, and
  Yarn 4 stops the hoisting only with Plug'n'Play or its `pnpm` linker, which pnpm does by default.
- **Keep `concurrently`**: an extra dependency with its own lockfile, which held 10 of the
  vulnerable packages reported by `npm audit`, while pnpm runs scripts in parallel itself.
- **Update the Dockerfiles to Node.js 24**: no workflow, script or host builds them, so they would
  be kept up to date for nothing.

## Consequences

Measured on the same machine (macOS, Node.js 24.22.0, npm 12.2.0, pnpm 12.14.0), with a warm
package cache, as the median of 3 runs of `/usr/bin/time -p`, except the CI rows, which come from
one GitHub Actions run each with a warm cache:

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

- The test and build times include the start of npm or pnpm.
- The CI runs are the last one on `master` before the change
  ([run](https://github.com/AIssoufi/pedalboards/actions/runs/39382811871)) and the second attempt
  of the pull request's run, once the first one had saved the pnpm store
  ([run](https://github.com/AIssoufi/pedalboards/actions/runs/39386225875/attempts/2)). The whole
  run is not shorter: installing pnpm itself (`pnpm/action-setup`) takes 14 s across the three
  jobs (4 to 5 s each), about the 15 s that the install step saves.
- The built files differ by a few bytes because the two apps now share one version of build
  packages such as `caniuse-lite`.
- The advisories are the distinct GitHub advisories that `npm audit` reported for the four npm
  lockfiles, and that `pnpm audit` reports for the workspace: none of the latter is new.
- A package is linked once per version from the pnpm store for the three apps, instead of being
  copied into each app.
- Each app must declare every package it imports: the strict layout of pnpm hides the others.
- A future dependency that needs its install script must be allowed in `allowBuilds`.
- `extendNodePath: false` stays as long as an app relies on `NODE_PATH`, that is until it leaves
  Create React App ([#33](https://github.com/AIssoufi/pedalboards/issues/33) for the frontend,
  [#45](https://github.com/AIssoufi/pedalboards/issues/45) for the CMS).
- The development servers of the frontend and the CMS still do not start on Node.js 24: the
  `webpack-dev-server` 3 of Create React App 2 calls `process.binding('http_parser')`, which
  Node.js removed. The same issues fix it.
