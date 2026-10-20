# Description
Conception et réalisation d'un magasin de plugin audio (pédale d’effet virtuel).

## Environnement Technique
- Langage : HTML 5, CSS 3, JavaScript (ES6 et 7)
- OS : macOS
- Library : ReactJS, ReduxJS, Recompose, Sass, Express, mongodb, lodash
- Base de données:  MongoDB
- Outil : Docker, Postman, Git, SourceTree, GitLab, Visual Studio Code


# Essayer le site en ligne

[Front End](https://pedalboards-frontend.herokuapp.com)

[Back End](https://pedalboards-cms.herokuapp.com)

[API Server](https://pedalboards-core-service.herokuapp.com)

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
pnpm start:dev
```

Ce script va lancer l'application web et tous les services nécessaire a son fonctionnement. 
Les services lancé sont :
* mongoDB
* core-service
* fontend
* cms

## MongoDB (sur MAC)

### Installation de mongoDB

```bash
cd pedalboards-core-service 
pnpm mongo:install
```

Ce script va installer le serveur mongodb sur votre machine.

### Import de la BD
```bash
cd pedalboards-core-service
pnpm mongo:import
```

Ce script va importer la base de données sur mongoDB.
Après l'importation vous aurez:
 - une base de données appelé `mbds`
 - une collection appelée `pedalboards`

## Core service configuration

- The core service reads its configuration from environment variables only.
- For local runs, copy `.env.example` to `.env` (ignored by git and Docker):

```bash
cd pedalboards-core-service
cp .env.example .env
```

| Variable     | Description                                   | Default                     |
|--------------|-----------------------------------------------|-----------------------------|
| `URL`        | MongoDB connection string                     | `mongodb://localhost:27017` |
| `DB`         | Database name                                 | `mbds`                      |
| `COLLECTION` | Collection that stores the pedalboards        | `pedalboards`               |
| `PORT`       | HTTP port of the API                          | `80`                        |

- Never commit a connection string that holds credentials: pass `URL` through the host environment
  (`URL=... pnpm start`, `docker run --env-file .env`).

## Architecture

| Dossier                  	| Description                                                                  	| Technos     	|
|--------------------------	|------------------------------------------------------------------------------	|-------------	|
| pedalboards-cms          	| Le CMS permettant de gérer  les pedaliers (création,  suppressiosn, édition) 	| ReactJS, Sass    |
| pedalboards-core-service 	| L'API RESTful                                                                	| Express, MongoDB    	|
| pedalboards-frontend     	| L'application web des  pédaliers                                             	| React, Sass, Redux, Recompose	|

## pnpm workspace

- The three apps form a pnpm workspace ([`pnpm-workspace.yaml`](pnpm-workspace.yaml)) with a single
  lockfile, `pnpm-lock.yaml`, that `pnpm install` installs from the root or from any app's folder.
- Run a script of one app with `pnpm <script>` in its folder, or with
  `pnpm --filter <app> <script>` from the root (`pnpm --filter pedalboards-cms test`).
- Each app declares every package it imports: unlike npm, pnpm does not put the dependencies of
  dependencies within its reach.

| Root script        | What it does                                                       |
|--------------------|--------------------------------------------------------------------|
| `pnpm start`       | Starts the API (port 8080), the frontend (3001) and the CMS (3002) |
| `pnpm start:dev`   | Starts MongoDB (`mongod`) too                                      |
| `pnpm start:<app>` | Starts one of them: `core-service`, `frontend`, `cms` or `mongodb` |
| `pnpm test`        | Runs the tests of the frontend and the CMS once                    |
| `pnpm build`       | Builds the frontend and the CMS                                    |
| `pnpm smoke`       | Checks that the API starts and answers, without MongoDB            |

- `pnpm start` and `pnpm start:dev` keep the other processes running when one of them stops
  (`--no-bail`), as `concurrently` did.
- `pnpm-workspace.yaml` runs no install script of the dependencies (`allowBuilds`), since none is
  needed, and stops pnpm from setting `NODE_PATH` (`extendNodePath: false`), which would hide the
  `NODE_PATH=src/` of the frontend and CMS `.env` files from Create React App.

## Node.js 24

- The three apps install, test and build on Node.js 24, the current LTS: [`.nvmrc`](.nvmrc) pins it,
  and the `engines` field of every `package.json` requires it.
- The development servers of the frontend and the CMS do not start on Node.js 24 yet:
  `webpack-dev-server` 3 of Create React App 2 loads `http-deceiver`, which calls
  `process.binding('http_parser')`, removed from Node.js. They work again when each app leaves
  Create React App ([#33](https://github.com/AIssoufi/pedalboards/issues/33) for the frontend,
  [#45](https://github.com/AIssoufi/pedalboards/issues/45) for the CMS).
- The frontend and the CMS compile their styles with Dart Sass, installed under the `node-sass` name
  (`"node-sass": "npm:sass@…"`): `sass-loader` 7 of Create React App 2 only loads a module called
  `node-sass`, and `node-sass` itself has no build for Node.js 24. The alias goes away when an app
  leaves Create React App ([#33](https://github.com/AIssoufi/pedalboards/issues/33) for the
  frontend).
- Their `start` and `build` scripts set `NODE_OPTIONS=--openssl-legacy-provider`: webpack 4 hashes
  modules with MD4, which OpenSSL 3 disables. The flag also goes away when an app leaves Create
  React App.

## Continuous integration

The [CI workflow](.github/workflows/ci.yml) runs on the Node.js version of `.nvmrc` for every pull
request to `master` and every push to `master`, with one job per app, which caches the pnpm store:

| Job          | Steps                                                                           |
|--------------|---------------------------------------------------------------------------------|
| Frontend     | `pnpm install --frozen-lockfile`, `CI=true pnpm test`, `CI=true pnpm run build` |
| CMS          | `pnpm install --frozen-lockfile`, `CI=true pnpm test`, `CI=true pnpm run build` |
| Core service | `pnpm install --frozen-lockfile`, `pnpm run smoke`                              |

- `pnpm run smoke` starts the API on a free port and checks that it answers, without MongoDB: the
  core service has no test runner yet.
- `CI=true` runs Jest once instead of in watch mode, and turns the lint warnings of the build into
  errors.
- To reproduce a failing job, run its steps in the app's folder.
