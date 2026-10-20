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

## Write routes, local only

The create, update and delete routes of the CMS run in a local API only, on a local D1 and an R2
bucket that wrangler simulates on disk, with no Cloudflare account:

```bash
pnpm start:local
```

- It applies the migrations, then serves the `local` environment of
  [`wrangler.jsonc`](wrangler.jsonc) on port 8080, which the CMS and the frontend call in
  development.
- Its D1 and its R2 bucket live in `.wrangler`, apart from the D1 of `pnpm start`.

| Route | Answer |
| --- | --- |
| `POST /api/plugin` | Creates a plugin from a multipart form: `201` with `{ msg, data }`, or `409` when its id is taken |
| `PUT /api/plugin/:id` | Changes the fields of the form, and keeps the others: `{ msg, data }`, or a `404` |
| `DELETE /api/plugin/:id?page=1&pagesize=10` | Deletes the plugin and its image: `{ msg, data, count, deletedCount, currentPage, numberPages }` |
| `GET /api/images/:id` | The image of a plugin, with its type, or a `404` |

- The form fields are `name` (required to create, it gives the id: `MDA Overdrive` becomes
  `mda-overdrive`), `label`, `brand`, `description`, `uri`, `version`, `pedalboardCount`,
  `categories` (separated by commas), `author` (a JSON object) and `controlPorts` (a JSON array of
  objects).
- An `image` file, PNG, JPEG, GIF or WebP of at most 5 MiB, goes into R2, and `screenshotUrl`
  becomes its address on the API. A form stops at 6 MiB.
- A bad field answers `400`, as the read routes do.
- The deployed Worker never mounts these routes: [`src/index.js`](src/index.js) imports the read
  router only, and `pnpm check:bundle` fails when the bundle written by `pnpm build` holds a write
  route or the multipart parser. The CI runs it.
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
| `pnpm start:local` | Applies the migrations to the local D1 of the `local` environment, then serves the local API, with the write routes, on port 8080 |
| `pnpm db:migrate:local` | Applies the migrations to the local D1, kept in `.wrangler` |
| `pnpm db:seed:generate` | Writes `migrations/0002_seed_plugins.sql` from `data/plugins.json` |
| `pnpm test` | Runs the tests with Vitest in the Workers runtime, against a local D1 filled by the migrations |
| `pnpm build` | Bundles the Worker into `dist`, as the deployment does, without publishing it |
| `pnpm check:bundle` | Fails when the bundle holds a write route or a multipart parser |
| `pnpm run deploy` | Applies the migrations to the remote D1, then deploys the Worker (Workers Builds runs it) |

`pnpm deploy`, without `run`, is a built-in command of pnpm, not this script.

Only `pnpm run deploy` needs a Cloudflare account. Workers Builds runs it on each push to `master`.
