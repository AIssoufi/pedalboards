# Evolution

The tools and the architecture of the project over time, oldest first. Each step links the
decision record that explains it.

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
