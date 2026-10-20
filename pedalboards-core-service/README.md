# pedalboards-core-service

The REST API of the plugins: Express 5 running in a Cloudflare Worker, on a D1 database. The
deployed Worker serves the read routes only, on `pedalboards.issoufi.fr/api/*`
([decision record](../docs/decisions/0005-cloudflare-pages-and-d1-worker.md)).

## Read routes

| Route | Answer |
| --- | --- |
| `GET /api/plugins?page=1&pagesize=10` | `{ msg, data, count, currentPage, numberPages }`, sorted by name |
| `GET /api/plugins?filterby[name]=gate` | The same, for the plugins whose `name` holds `gate` |
| `GET /api/plugins/count?name=gate` | `{ msg, data }`, where `data` is the number of plugins whose name holds `gate` |
| `GET /api/plugin/:id` | `{ msg, data }`, or a `404` |

- `page` and `pagesize` fall back to 1 and 10 unless they are integers of at least 1, and
  `pagesize` stops at 100.
- The filters (`filterby[<field>]`) search `brand`, `categories`, `label` and `name` only, and
  another field answers `400`. A plugin matches when one of the filtered fields holds its text,
  taken literally (`%` and `_` included), whatever the case of ASCII letters.
- Errors are short JSON messages, never a stack: `400` for bad input, `503` when the database
  fails, `500` otherwise, and a JSON `404` for an unknown route.

## Write routes, not deployed

- The create, update and delete routes of the CMS are in
  [`src/routes/write.js`](src/routes/write.js). No runtime mounts them: only their tests import
  them.
- `pnpm check:bundle` fails when the bundle written by `pnpm build` holds them or a multipart
  parser, and the CI runs it.
- Their local environment (a local D1, a simulated R2 bucket for the images and the CMS) is
  [#53](https://github.com/AIssoufi/pedalboards/issues/53).
- `public/screenshots` holds images that the former Express service received from the CMS. No
  record of `data/plugins.json` uses them.

## Data

- [`migrations/0001_create_plugins.sql`](migrations/0001_create_plugins.sql) creates the `plugins`
  table. Its `author`, `categories` and `controlPorts` columns hold JSON.
- [`migrations/0002_seed_plugins.sql`](migrations/0002_seed_plugins.sql) inserts the 50 records of
  [`data/plugins.json`](data/plugins.json). `pnpm db:seed:generate` writes it from that file, with
  ids made from the plugin names (`MDA Overdrive` becomes `mda-overdrive`).
- A change to the data after the deployment goes into a new migration: D1 applies each migration
  once.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm start` | Applies the migrations to a local D1, then serves the Worker on port 8080 with `wrangler dev` |
| `pnpm db:migrate:local` | Applies the migrations to the local D1, kept in `.wrangler` |
| `pnpm db:seed:generate` | Writes `migrations/0002_seed_plugins.sql` from `data/plugins.json` |
| `pnpm test` | Runs the tests with Vitest in the Workers runtime, against a local D1 filled by the migrations |
| `pnpm build` | Bundles the Worker into `dist`, as the deployment does, without publishing it |
| `pnpm check:bundle` | Fails when the bundle holds a write route or a multipart parser |
| `pnpm run deploy` | Applies the migrations to the remote D1, then deploys the Worker (Workers Builds runs it) |

`pnpm deploy`, without `run`, is a built-in command of pnpm, not this script.

Only `pnpm run deploy` needs a Cloudflare account. Workers Builds runs it on each push to `master`.
