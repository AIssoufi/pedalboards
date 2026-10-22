# Pedalboards frontend

The web app that visitors use to browse the plugins, built with React, Redux and Sass on
[Vite](https://vite.dev), and tested with [Vitest](https://vitest.dev) and
[Testing Library](https://testing-library.com/docs/react-testing-library/intro).

## Scripts

Run them in this folder, or from the root with `pnpm --filter pedalboards-frontend <script>`:

| Script                  | What it does                                                             |
|-------------------------|--------------------------------------------------------------------------|
| `pnpm dev`              | Serves the app on [http://localhost:3001](http://localhost:3001), with hot reload |
| `pnpm build`            | Builds the app into `build/`, the folder that Cloudflare Pages publishes |
| `pnpm preview`          | Serves the content of `build/` to try the production build               |
| `pnpm test`             | Runs the tests once, in jsdom; `pnpm vitest` runs them in watch mode     |
| `pnpm lint`             | Lints the app with ESLint, and fails on any warning                      |
| `pnpm check:dev-server` | Starts the dev server on a free port and checks that it serves the app   |
| `pnpm check:bundle`     | Fails when the scripts of `build/` hold development-only code; run `pnpm build` first |
| `pnpm report:bundle`    | Builds the app and writes `bundle-report.html`, the share of each package and module in its scripts |

- `pnpm dev` fails when port 3001 is taken, rather than moving to 3002, the port of the CMS.
- `pnpm report:bundle` measures the minified scripts through source maps
  ([rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)), so it also writes
  `.map` files into `build/`: run `pnpm build` again before publishing that folder. The report
  gives no gzip size.
- The store checks in development and in the tests only that the state is never mutated and
  holds only serializable values (Redux Toolkit): the production build leaves these checks out,
  and `pnpm check:bundle` fails when they ship.
- The CI runs `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:bundle` and
  `pnpm check:dev-server`.

## Environment variables

Vite reads them from the `.env.<mode>` file of this folder: `.env.development` for `pnpm dev`,
`.env.production` for `pnpm build` and `.env.test` for `pnpm test`. A variable set in the shell
takes precedence over the file. The Pages build did not get the Preview variables of the Pages
settings, so `.env.production` holds the values of every Pages deployment.

| Variable            | What it holds                        | Development             |
|---------------------|--------------------------------------|-------------------------|
| `VITE_CORE_SERVICE` | Address of the API, empty for the origin of the site | `http://localhost:8080` |
| `VITE_BACKEND`      | Address of the CMS, empty to hide the "Admin Panel" link | `http://localhost:3002` |

- The code reads them with `Env.get('core_service')` and `Env.get('backend')`
  ([`src/utils/env.js`](src/utils/env.js)).
- Vite writes every `VITE_` variable into the bundle that visitors download: never give one a
  secret.
