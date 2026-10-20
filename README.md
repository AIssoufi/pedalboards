# Description
Conception et réalisation d'un magasin de plugin audio (pédale d’effet virtuel).

## Environnement Technique
- Langage : HTML 5, CSS 3, JavaScript (ES6 et 7)
- OS : macOS
- Library : ReactJS, ReduxJS, Recompose, Sass, Express, lodash
- Database: Cloudflare D1
- Hosting: Cloudflare Pages and Workers
- Tools: Postman, Git, SourceTree, GitLab, Visual Studio Code


# Try the site online

[pedalboards.issoufi.fr](https://pedalboards.issoufi.fr): the frontend, and its API under `/api`.
The CMS is not deployed (see [Deployment](#deployment)).

# Essayer le site en local

## Prerequisites

- Node.js 24, the version of [`.nvmrc`](.nvmrc): `nvm use` selects it.
- pnpm 10 or later: it switches by itself to the version of the `packageManager` field of
  `package.json`.

## Installation des dépendences

```bash
pnpm install
```

Cette commande va installer toutes les dépendances des micro-services suivants :
* Pedalbords CMS
* Pedalbords Core Service
* Pedalboards Frontend

## Lancer le projet

```bash
pnpm start
```

This script starts the API, the frontend and the CMS.

## Core service

- The API is a Cloudflare Worker: Express 5 on a D1 database. `pnpm start:core-service` applies
  the migrations to a local D1, kept in `pedalboards-core-service/.wrangler`, then serves the
  Worker with `wrangler dev` on port 8080, with no Cloudflare account.
- It serves the read routes only: `GET /api/plugins`, `GET /api/plugins/count` and
  `GET /api/plugin/:id`. Its [README](pedalboards-core-service/README.md) describes them, with
  the write routes kept for the CMS.
- The migrations, in `pedalboards-core-service/migrations`, create the `plugins` table and fill it
  with the records of `data/plugins.json`. After a change to that file, run
  `pnpm db:seed:generate` in `pedalboards-core-service` to write the seed migration again.

## Architecture

| Dossier                  	| Description                                                                  	| Technos     	|
|--------------------------	|------------------------------------------------------------------------------	|-------------	|
| pedalboards-cms          	| Le CMS permettant de gérer  les pedaliers (création,  suppressiosn, édition) 	| ReactJS, Sass    |
| pedalboards-core-service 	| The REST API                                                                 	| Express, Cloudflare Workers, D1	|
| pedalboards-frontend     	| The web app of the pedalboards ([README](pedalboards-frontend/README.md))	| React, Sass, Redux, Recompose, Vite, Vitest	|
| tools/commit-messages    	| The commitlint rule and the hook script that check the [commit messages](#commit-messages), with their tests	| Node.js, commitlint	|
| tools/dev-server-check   	| The check that a dev server starts and serves its app, with the tests of its helpers	| Node.js	|
| .husky                   	| The git hooks that `pnpm install` turns on                                   	| husky	|

The history of the project's tools and architecture, with its decision records, is in
[`docs/evolution.md`](docs/evolution.md).

## pnpm workspace

- The three apps form a pnpm workspace ([`pnpm-workspace.yaml`](pnpm-workspace.yaml)) with a single
  lockfile, `pnpm-lock.yaml`, that `pnpm install` installs from the root or from any app's folder.
- Run a script of one app with `pnpm <script>` in its folder, or with
  `pnpm --filter <app> <script>` from the root (`pnpm --filter pedalboards-cms test`).
- Each app declares every package it imports: unlike npm, pnpm does not put the dependencies of
  dependencies within its reach.

| Root script                 | What it does                                                       |
|-----------------------------|--------------------------------------------------------------------|
| `pnpm start`                | Starts the API (port 8080), the frontend (3001) and the CMS (3002) |
| `pnpm start:<app>`          | Starts one of them: `core-service`, `frontend` or `cms`            |
| `pnpm test`                 | Runs the tests below, then those of the three apps, once           |
| `pnpm test:commit-messages` | Runs the tests of the [commit message](#commit-messages) tools     |
| `pnpm test:dev-server-check`| Runs the tests of the helpers of the dev server check              |
| `pnpm build`                | Builds the frontend and the CMS                                    |
| `pnpm check:dev-server`     | Checks that the dev server of the frontend starts and serves it    |

- `pnpm start` keeps the other processes running when one of them stops (`--no-bail`), as
  `concurrently` did.
- `pnpm-workspace.yaml` runs no install script of the dependencies (`allowBuilds`), since none is
  needed, and stops pnpm from setting `NODE_PATH` (`extendNodePath: false`), which would hide the
  `NODE_PATH=src/` of the CMS `.env` file from Create React App.
- Its `packageExtensions` declare the React peer dependencies that `react-redux` 7 and
  `react-tippy` 1 leave out: without them, pnpm gave these packages the React of the CMS, and the
  frontend bundle held two copies of React.

## Node.js 24

- The three apps install, test and build on Node.js 24, the current LTS: [`.nvmrc`](.nvmrc) pins it,
  and the `engines` field of every `package.json` requires it.
- The frontend runs on Vite and Vitest
  ([decision record](docs/decisions/0006-vite-and-vitest.md)), so its development server starts
  on Node.js 24, and the CI checks it.
- The development server of the CMS does not start on Node.js 24 yet: `webpack-dev-server` 3 of
  Create React App 2 loads `http-deceiver`, which calls `process.binding('http_parser')`, removed
  from Node.js. It works again when the CMS leaves Create React App
  ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).
- The CMS compiles its styles with Dart Sass, installed under the `node-sass` name
  (`"node-sass": "npm:sass@…"`): `sass-loader` 7 of Create React App 2 only loads a module called
  `node-sass`, and `node-sass` itself has no build for Node.js 24. The frontend installs `sass`
  under its own name, which Vite loads.
- The `start` and `build` scripts of the CMS set `NODE_OPTIONS=--openssl-legacy-provider`:
  webpack 4 hashes modules with MD4, which OpenSSL 3 disables. The alias and the flag go away when
  the CMS leaves Create React App.

## Commit messages

Every commit follows [Conventional Commits](https://www.conventionalcommits.org/) and names its
ticket in a `Refs: PEDAL-<number>` trailer, in the last paragraph of the message, next to
`Co-Authored-By`:

```text
feat(cms): add the pedal editor

Lets the user add, move and remove the pedals of a pedalboard.

Refs: PEDAL-47
Co-Authored-By: Claude <noreply@anthropic.com>
```

- [`commitlint.config.mjs`](commitlint.config.mjs) extends `@commitlint/config-conventional`, so
  the header and the body lines stay within 100 characters, and adds the `ticket-reference-exists`
  rule of [`tools/commit-messages`](tools/commit-messages). Older commits, where a blank line
  follows `Refs:`, still pass.
- Merge commits, `fixup!` and `squash!` commits, the commits signed off by a bot such as
  Dependabot and the release commits (`chore(master): release 1.2.0`) need no reference.
- `pnpm install` turns on two [husky](https://typicode.github.io/husky/) hooks, in
  [`.husky`](.husky):
  - `prepare-commit-msg` adds `Refs: <branch>` on a ticket branch, such as `PEDAL-47`, unless the
    message has a `Refs:` line already or is a merge or `fixup!` commit;
  - `commit-msg` runs commitlint and refuses a message that breaks the rules.
- On another branch, or on a detached HEAD during a rebase, write the trailer yourself.
  `git commit --no-verify` skips the `commit-msg` check, but the CI still checks the commits.
- The [commit messages workflow](.github/workflows/commit-messages.yml) checks every commit of a
  pull request and its title, which needs no reference since the body says `Closes #<number>`.
- Check a message by hand with `printf 'feat: x\n\nRefs: PEDAL-47\n' | pnpm exec commitlint`.

## Continuous integration

The [CI workflow](.github/workflows/ci.yml) runs on the Node.js version of `.nvmrc` for every pull
request to `master` and every push to `master`, with one job per app, which caches the pnpm store:

| Job          | Steps                                                                           |
|--------------|---------------------------------------------------------------------------------|
| Frontend     | `pnpm install --frozen-lockfile`, `CI=true pnpm test`, `CI=true pnpm run build`, `pnpm --workspace-root run test:dev-server-check`, `pnpm run check:dev-server` |
| CMS          | `pnpm install --frozen-lockfile`, `CI=true pnpm test`, `CI=true pnpm run build` |
| Core service | `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm run build`, `pnpm run check:bundle` |

- The core service runs its tests with Vitest in the Workers runtime, against a local D1 that the
  migrations fill. `pnpm run build` bundles the Worker into `dist` without publishing it, and
  `pnpm run check:bundle` fails when that bundle holds a write route or a multipart parser.
- `CI=true` runs the Jest of the CMS once instead of in watch mode, and turns the lint warnings of
  its build into errors. The frontend runs Vitest once (`vitest run`) and ignores it.
- `pnpm run check:dev-server` starts the dev server of the frontend on a free port, checks that the
  page answers with HTML and each of its scripts with JavaScript, then stops it.
- To reproduce a failing job, run its steps in the app's folder.

The [commit messages workflow](.github/workflows/commit-messages.yml) runs for every pull request
to `master`, and again when its title changes. Its job, Commit messages:

1. installs only the tools of the workspace root, without a pnpm cache:
   `pnpm install --frozen-lockfile --filter pedalboards`;
2. runs `pnpm test:commit-messages`;
3. runs commitlint on the commits of the pull request, then on its title, except for the pull
   requests of bots, such as Dependabot's `Bump x from 1 to 2`, whose commits pass as commits of
   a bot.

## Deployment

The site runs on Cloudflare at [pedalboards.issoufi.fr](https://pedalboards.issoufi.fr), on one
origin ([decision record](docs/decisions/0005-cloudflare-pages-and-d1-worker.md)):

| Part | Host | Built from | Configuration |
| --- | --- | --- | --- |
| Frontend | Pages project `pedalboards` | the repository root, `pnpm --filter pedalboards-frontend build` | [`wrangler.jsonc`](wrangler.jsonc) |
| API | Worker `pedalboards-api` on `pedalboards.issoufi.fr/api/*`, D1 database `pedalboards` | `pedalboards-core-service`, `pnpm run deploy` | [`pedalboards-core-service/wrangler.jsonc`](pedalboards-core-service/wrangler.jsonc) |
| CMS | not deployed | none | none |

- Cloudflare builds and deploys both on each push to `master`, through its GitHub connection:
  Pages for the frontend, Workers Builds for the API. Nothing in GitHub holds a Cloudflare token.
- `pnpm run deploy` applies the D1 migrations that the remote database lacks, then deploys the
  Worker.
- The production frontend calls `/api` on its own origin: `.env.production` leaves
  `VITE_CORE_SERVICE` empty. Pages preview deployments set it to
  `https://pedalboards.issoufi.fr` in the Pages settings.
- `.env.production` leaves `VITE_BACKEND` empty too, so the header hides its "Admin Panel"
  link. The CMS and the write routes of the API stay in the repository: their local environment
  is [#53](https://github.com/AIssoufi/pedalboards/issues/53).
