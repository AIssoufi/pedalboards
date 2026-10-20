# Pedalboards frontend

The web app that visitors use to browse the plugins, built with React, Redux and Sass on
[Vite](https://vite.dev), and tested with [Vitest](https://vitest.dev).

## Scripts

Run them in this folder, or from the root with `pnpm --filter pedalboards-frontend <script>`:

| Script                  | What it does                                                             |
|-------------------------|--------------------------------------------------------------------------|
| `pnpm dev`              | Serves the app on [http://localhost:3001](http://localhost:3001), with hot reload |
| `pnpm build`            | Builds the app into `build/`, the folder that Cloudflare Pages publishes |
| `pnpm preview`          | Serves the content of `build/` to try the production build               |
| `pnpm test`             | Runs the tests once, in jsdom; `pnpm vitest` runs them in watch mode     |

- `pnpm dev` fails when port 3001 is taken, rather than moving to 3002, the port of the CMS.
- The CI runs `pnpm test` and `pnpm build`.

## Environment variables

Vite reads them from the `.env.<mode>` file of this folder: `.env.development` for `pnpm dev`,
`.env.production` for `pnpm build` and `.env.test` for `pnpm test`. A variable set in the shell
or in the Pages settings takes precedence over the file.

| Variable            | What it holds                        | Development             |
|---------------------|--------------------------------------|-------------------------|
| `VITE_CORE_SERVICE` | Address of the API, empty for the origin of the site | `http://localhost:8080` |
| `VITE_BACKEND`      | Address of the CMS, empty to hide the "Admin Panel" link | `http://localhost:3002` |

- The code reads them with `Env.get('core_service')` and `Env.get('backend')`
  ([`src/utils/env.js`](src/utils/env.js)).
- Vite writes every `VITE_` variable into the bundle that visitors download: never give one a
  secret.
