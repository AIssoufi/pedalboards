# 0011. Adopt Node.js 26 LTS

- Date: 2026-10-31
- Status: Accepted

## Context

- [0001](0001-pnpm-workspaces-and-node-24.md) pinned Node.js 24 in `.nvmrc` and required it in the
  `engines` field of every `package.json`. The CI, Cloudflare Pages and Workers Builds read
  `.nvmrc`, and the CI workflow says that a new LTS is adopted on purpose.
- The first LTS release of Node.js 26 is v26.13.0, of 2026-10-28. Node.js 24 entered maintenance
  on 2026-10-20 and ends on 2028-04-30, so the move was not urgent, but the README called 24 the
  current LTS.

## Decision

- `.nvmrc` pins Node.js 26, and `engines` asks for `>=26` in the four `package.json` files.
- No file of `.github/workflows` changes: they name no version and read `.nvmrc`.
- The README no longer names the version in its section on Node.js, so the next LTS only touches
  the facts that really depend on it.

The pull request closes [#173](https://github.com/AIssoufi/pedalboards/issues/173).

## Alternatives considered

- **Stay on Node.js 24 until its end of life**: nothing forces the move before 2028, but every
  check passes on 26 today, so waiting only keeps a version in maintenance.
- **Leave `engines` at `>=24`**: it would accept a version that the CI no longer runs, and
  `engines` promises what the project checks.

## Consequences

Measured on 2026-10-31 on an Apple M3 (8 cores), with pnpm 12.14.0: Node.js 24.22.0 on the base
and 26.13.0 on the branch, three runs each.

| Figure | Before (`dee9e109`, Node.js 24) | After (Node.js 26) |
| --- | --- | --- |
| Install after deleting `node_modules`, median of 3 | 1.7 s | 1.9 s |
| `pnpm build`, median of 3 | 2.7 s | 2.4 s |
| `pnpm test`, median of 3 | 8.5 s | 6.9 s |
| Tests of `pnpm test`, all passing | 1,400 | 1,400 |
| Frontend JS, raw / gzipped | 401,496 / 123,120 B | the same |
| Frontend CSS, raw / gzipped | 34,816 / 5,977 B | the same |
| Workspace audit advisories, critical / high / moderate / low | 27 / 100 / 69 / 25 | the same |

- The ranges of the three runs overlap or touch (install 1.6 to 1.8 s against 1.8 to 2.0 s, build
  2.4 to 4.9 s against 2.2 to 3.1 s, tests 7.7 to 13.4 s against 6.9 to 10.6 s), so these times show
  no clear gain or loss.
- No dependency, source file or workflow changes, and no step of the CI prints a Node.js
  deprecation warning on 26: the `DEP0176` warning of `fs.F_OK` that the CMS printed on 24 is gone,
  since Node.js 26 removed the constant. The CMS build keeps its 24 Dart Sass deprecation warnings,
  as on 24.
- The development server of the CMS fails on Node.js 26 as it did on 24, with the same
  `http_parser` error, and still comes back when the CMS leaves Create React App
  ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).
- `pnpm start` serves the frontend and the API on Node.js 26, as `check:dev-server` does in the CI
  for the frontend.
- A contributor needs Node.js 26: `nvm use` selects it. `pnpm install --frozen-lockfile` on Node.js
  24 still exits 0 and prints no warning, so `engines` does not enforce this locally.
