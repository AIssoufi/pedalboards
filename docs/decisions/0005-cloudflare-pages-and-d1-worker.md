# 0005. Deploy the frontend on Cloudflare Pages and a read-only API Worker on D1

- Date: 2026-10-20
- Status: Accepted

## Context

- Nothing was deployed: the three Heroku apps that the README linked answer `404`.
- The target is `pedalboards.issoufi.fr`, on the owner's Cloudflare account and its free plan.
- The public site only reads the plugins. The data is the 50 records of
  `pedalboards-core-service/data/plugins.json` (85 KB). Their screenshots stay on their external
  URLs.
- The core service could not run there:
  - it used the TCP MongoDB driver, which does not run on Workers;
  - it wrote image uploads to disk with `multer`;
  - it had no test of its routes.
- The production builds of the frontend baked the dead Heroku URLs in, from `.env.production`.

## Decision

### Hosting

| Part | Host | Address |
| --- | --- | --- |
| Frontend | Cloudflare Pages project `pedalboards` | `pedalboards.issoufi.fr` |
| API | Worker `pedalboards-api`, D1 database `pedalboards` bound as `DB` | route `pedalboards.issoufi.fr/api/*` |
| CMS | not deployed | none |

- **One origin.** The Worker answers `/api/*` in front of the Pages project. So the production
  frontend calls `/api` on its own origin, and `.env.production` leaves the API address empty.
- **Deep links.** The Pages build has no `404.html`, so Pages serves `index.html` for unknown
  paths, and deep links such as `/plugin/<id>` load the app.
- **The CMS link.** The CMS address is empty too, so the header of the frontend hides its
  "Admin Panel" link.
- **Configuration in the repository.**
  - The root `wrangler.jsonc` configures the Pages project: its name and its output folder,
    `pedalboards-frontend/build`.
  - `pedalboards-core-service/wrangler.jsonc` configures the Worker: its route, the
    `nodejs_compat` flag and the D1 binding.
  - The dashboard holds what a file cannot hold: the build command, the Node.js and pnpm versions
    of the build, and the custom domain.

### The read-only Worker

- **Express 5 runs in the Worker.** `src/index.js` mounts the read router only:

  | Route | Answer |
  | --- | --- |
  | `GET /api/plugins` | a page of plugins |
  | `GET /api/plugins/count` | the number of plugins |
  | `GET /api/plugin/:id` | one plugin |

  `httpServerHandler` of `cloudflare:node` serves the app. Any other route answers a JSON `404`.
- **The D1 schema.** A `plugins` table holds one column per field. Its `author`, `categories` and
  `controlPorts` columns hold JSON. Two migrations fill it:
  - `0001` creates the table;
  - `0002` holds the seed, which `pnpm db:seed:generate` writes from `data/plugins.json`.
- **Safe search.**
  - Only `brand`, `categories`, `label` and `name` can be searched.
  - The values are bound parameters, and `LIKE` patterns escape `%`, `_` and `\`.
  - The results are sorted by name before paging.
  - `page` and `pagesize` fall back to their defaults unless they are integers of at least 1, and
    `pagesize` stops at 100.
- **Short errors.** An error is a short JSON message, never a stack:
  - `400` for bad input;
  - `503` when the database fails;
  - `500` otherwise.
- **The write routes stay in the repository, not deployed.**
  - The create, update and delete routes of the CMS stay in `src/routes/write.js`, which only
    their tests import, behind a store and an upload parser passed in.
  - `pnpm check:bundle`, run in the CI, fails when the Worker bundle holds `createWriteRouter`,
    `multer` or `busboy`.
  - The local environment of the writes (a local D1, a simulated R2 bucket and the CMS) is
    [#53](https://github.com/AIssoufi/pedalboards/issues/53).
- **Removed.**
  - The MongoDB service, its server, `routes/plugin.route.js`, the smoke check and `.env.example`.
  - `body-parser`, `dotenv`, `mongodb`, `multer`, `nodemon` and the Babel packages.

### Deployment

- **Workers Builds deploys the Worker.** Cloudflare, connected to the GitHub repository, builds
  the Worker on each push to `master`, from `pedalboards-core-service`. It runs `pnpm run deploy`:
  `wrangler d1 migrations apply DB --remote`, then `wrangler deploy`.
- **Pages deploys the frontend.** It builds on each push, from the same repository.
- **Nothing in GitHub holds a Cloudflare token.**

### Tests

- Vitest and `@cloudflare/vitest-plugin` run the tests in the Workers runtime, against a local D1
  that the migrations fill.
- The CI job of the core service now runs:
  1. `pnpm test`;
  2. `pnpm run build`, which bundles the Worker without publishing it;
  3. `pnpm run check:bundle`.

Made for issue [#27](https://github.com/AIssoufi/pedalboards/issues/27).

## Alternatives considered

### Storage

- **A JSON file bundled in the Worker.** It is the simplest for 50 read-only records. But the CMS
  writes the plugins, and #53 brings those writes back. They need a database, and moving to one
  later would rewrite the read routes again.
- **Workers KV.** KV stores values by key. The list filters on four fields, sorts by name and
  pages, so the Worker would load every record and filter them itself. KV is also eventually
  consistent, which suits the writes of #53 badly.
- **MongoDB Atlas.** It would keep the queries of the old service. But it needs a second account,
  a connection string held as a secret, and a driver that opens TCP connections from the Worker.
  Every request would also cross to a database outside Cloudflare.

### Deployment

- **A GitHub Actions deploy job.** It would put a Cloudflare API token in the secrets of the
  repository, and a workflow that can publish. Workers Builds deploys with no secret in GitHub,
  and the dashboard shows its logs.

### API

- **Express 4, as before.** It does not start in the Worker. `iconv-lite` 0.4.24, loaded by
  `raw-body` 2.4.0 of `body-parser` 1.19.0, fails at load with
  `TypeError: require_streams(...) is not a function`. Express 5 starts and passes the tests.
- **Hono in place of Express.** It is made for Workers, but it means rewriting every route and its
  tests. Express 5 runs as it is, so Hono stays an option if Express stops working.

### Hosting

- **Pages Functions in place of a Worker route.** They would live in the Pages project of the
  frontend and deploy with each of its builds. A Worker keeps the API in its own app, with its own
  tests, bindings and deployment.

### The write routes

- **Deploy them now, or delete them.** The owner chose to ship a read-only Worker first and to keep
  the routes for #53, which gives them a local environment before any deployment.

## Consequences

| Figure | Before (`04e4ed89`) | After |
| --- | --- | --- |
| Live site | none, the Heroku apps answer `404` | `pedalboards.issoufi.fr`, once the Cloudflare side is set up |
| Core service tests, all passing | 22 (`node --test`, MongoDB stand-in) | 81 (Vitest in the Workers runtime, local D1) |
| Core service test run, median of 3 | 0.24 s | 1.77 s |
| Core service direct dependencies | 5 + 3 dev | 1 + 3 dev |
| Core service packages, production / all | 90 / 372 | 73 / 341 |
| Production advisories of the core service | 30 (3 / 15 / 5 / 7) | 0 |
| Advisories of the core service, dev included | 69 (7 / 38 / 15 / 9) | 21 (2 / 8 / 11 / 0) |
| Audit advisories of the workspace | 28 / 112 / 72 / 25 | 27 / 103 / 69 / 24 |
| Install after deleting `node_modules`, median of 3 | 1.93 s | 1.95 s |
| Worker bundle, raw / gzipped | none | 1,167.60 KiB / 300.29 KiB |

### How the figures were measured

- The advisories are counted as critical / high / moderate / low.
- The advisories of the core service are those of `pnpm audit --json` whose path starts at
  `pedalboards-core-service`. The production row comes from `pnpm audit --prod --json`.
- The 21 advisories left all come from `jsdom` 15. pnpm links it to Vitest as an optional peer
  dependency, from the frontend's Create React App toolchain. The Worker never loads it.
- The packages are counted with `pnpm ls --depth Infinity --parseable` in the core service folder.
- The test runs are the wall time of `pnpm test` in the core service folder. The run now starts
  the Workers runtime and applies the migrations before the tests.
- The Worker bundle size is the one that `pnpm run build` prints.

### Follow-ups

- **The Cloudflare side is set up by hand, once.** The owner creates the D1 database, the Workers
  Builds connection, the Pages project, its custom domain and the preview variable of the API
  address. Then `database_id` goes into `pedalboards-core-service/wrangler.jsonc`.
- **Preview deployments of Pages** run on `*.pages.dev`, where `/api` does not exist. Their
  `REACT_APP_CORE_SERVICE` variable points at `https://pedalboards.issoufi.fr`, which the CORS
  headers of the Worker allow.
- **The CMS is not deployed.** Its write routes wait for
  [#53](https://github.com/AIssoufi/pedalboards/issues/53).
- **Local development.** `pnpm start:core-service` runs the Worker with `wrangler dev` on port 8080,
  where the frontend and the CMS already call it, on a local D1 that it migrates first.
