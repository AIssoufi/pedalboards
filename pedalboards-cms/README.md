# pedalboards-cms

The admin app of the plugins: it creates, edits and deletes them, with their image. React 16 on
Create React App 2. It is not deployed: it runs against the local API only.

## Run it against the local API

1. From the root, start the API with the write routes, on a local D1 and an R2 bucket that
   wrangler simulates, with no Cloudflare account:

   ```bash
   pnpm start:core-service:local
   ```

2. Start the CMS on [localhost:3002](http://localhost:3002), which calls the API on
   `REACT_APP_CORE_SERVICE` ([`.env.development`](.env.development): `http://localhost:8080`):

   ```bash
   pnpm start:cms
   ```

- The development server of the CMS does not start on Node.js 24 yet. It works again when the CMS
  leaves Create React App ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).
- The [README of the API](../pedalboards-core-service/README.md#write-routes-local-only) describes
  the routes and the form fields that the CMS sends.

## Pages

| Route | What it shows |
| --- | --- |
| `/plugins` | The plugins, page by page. `?name=gate` lists those whose name holds `gate` |
| `/plugin/add` | The form that creates a plugin, with a required image |
| `/plugin/edit/:id` | The same form, filled with the plugin, with an optional image |

Saved without a new image, an edited plugin keeps its own, as it keeps its author. When a request
fails, the page shows the message of the API, or why it could not reach it.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm start` | Serves the CMS on port 3002 |
| `pnpm test` | Runs the tests with Jest, in watch mode unless `CI=true` |
| `pnpm build` | Builds the CMS into `build` |
