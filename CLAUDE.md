# Pedalboards

A store of audio plugins: a pnpm workspace of three apps on Node.js 24 (`.nvmrc`). The
[README](README.md) explains how to run them; this file lists what agents must follow.

## Layout

- `pedalboards-frontend`: the store, Vite and React, with Redux Toolkit. Cloudflare Pages
  deploys it from `master` to https://pedalboards.issoufi.fr.
- `pedalboards-cms`: the admin panel, Create React App 2 and Jest. It is not deployed.
- `pedalboards-core-service`: the API, Express 5 in a Cloudflare Worker on D1. The deployed
  Worker serves the read routes only; the write routes run locally (`start:local`).
- `tools/`: the commitlint rule, the hook script and the dev server check, tested with
  `node --test`.
- `docs/decisions/`: the decision records; `docs/evolution.md`: the measured steps of the stack.
- `docs/ai-workflow/`: how the agents work here ([overview](docs/ai-workflow/overview.md)).

## Commands

Install once from the root: `pnpm install --frozen-lockfile`. Then, as the CI runs them:

- In `pedalboards-frontend`: `pnpm run lint`, `CI=true pnpm test`, `CI=true pnpm run build`,
  `pnpm run check:bundle`, `pnpm run check:dev-server`.
- In `pedalboards-cms`: `CI=true pnpm test`, `CI=true pnpm run build`.
- In `pedalboards-core-service`: `pnpm test`, `pnpm run build`, `pnpm run check:bundle`.
- At the root: `pnpm test:commit-messages`, `pnpm test:dev-server-check`.

- `CI=true` makes the Jest of the CMS run once instead of in watch mode.
- `check:bundle` reads the build: run it after `pnpm run build`.
- From the root, `pnpm test` runs every test suite, `pnpm lint` lints the frontend and
  `pnpm build` builds the frontend and the CMS; the bundle checks run in their package.

## Known gaps

- The CMS has no lint, and its dev server does not start on Node.js 24, until it leaves
  Create React App ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).
- The `env.js` helpers of the frontend and the CMS, and the `text.js` and `testing.jsx` of the
  CMS, are flat files in `src/utils`, not folders
  ([#79](https://github.com/AIssoufi/pedalboards/issues/79)).

## Code

- Plain JavaScript (`.js`, `.jsx`, `.mjs`), no TypeScript. Document functions and types with
  JSDoc. The frontend types its props with JSDoc typedefs and has no `prop-types`
  ([decision 0009](docs/decisions/0009-redux-toolkit-and-hooks.md)); the CMS still declares
  `propTypes`.
- In the frontend and the CMS, one kebab-case folder per component (the root `App.jsx` aside):
  `index.jsx`, `index.test.jsx` and its `style.scss`, with its own `constants.js`, `utils.js`
  (and `utils.test.js`) and `hooks/useName/index.js` beside them. Pages follow the same layout
  in `src/pages`.
- In the frontend and the CMS, a helper shared across components goes in
  `src/utils/<name>/index.js` with its `index.test.js`; the calls to the API stay in
  `src/helpers/` and `src/services/`.
- In the frontend and the CMS, imports are grouped under comments such as `// Dependencies`,
  `// Components`, `// Hooks`, `// Services`, `// Constants`, `// Utils` and `// Style`.
- Constants of a source file at module level, never inside a component or a function.
- A function of more than one argument takes one named-parameters object.
- The core service indents with tabs, the other apps with two spaces.
- Code, comments, commits, pull requests and docs are in English.

## Visible texts

- No em dash in the UI or the README.
- The owner's name is written `ADAM Issoufi`.
- The UI of both apps is in English: their pages declare `lang="en"`, and no element carries
  its own `lang`.

## Git

- Conventional Commits, checked by commitlint (`commitlint.config.mjs`), with a
  `Refs: PEDAL-<n>` trailer in the last paragraph. On a `PEDAL-<n>` branch, the
  `prepare-commit-msg` hook adds it.
- Fold `fixup!` commits before the merge, and rebase a work branch on `master` rather than
  merging `master` into it.
- A tool migration or a change of architecture adds, in the same pull request, a decision record
  in `docs/decisions/` (next free number) and a measured step in `docs/evolution.md`.
