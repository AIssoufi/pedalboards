# 0012. Lint the API and the repository tools with ESLint 9

- Date: 2026-11-01
- Status: Accepted

## Context

- [Decision 0008](0008-eslint-flat-config.md) gave the frontend a flat ESLint config. No linter
  read `pedalboards-core-service` or `tools/`, whose only checks were their tests.
- The preflight check of Create React App 2 in the CMS walks up from `react-scripts` and stops
  `start` and `build` when a `node_modules/eslint` holds another version than its own. The
  `node_modules` of the root is one of the folders it reads, so an ESLint 9 in the
  `devDependencies` of the root would stop the CMS, as the hoisted one did in decision 0008.
- ESLint reads a flat config only for the files under its folder, so a config in one package
  cannot lint a sibling folder.
- `tools/` was a plain folder, whose packages come from the root `package.json`.

## Decision

- `pedalboards-core-service` and `tools` each get an `eslint.config.mjs`, a `lint` script
  (`eslint . --max-warnings 0`) and the versions of ESLint, `@eslint/js`,
  `eslint-plugin-import-x` and `globals` that the frontend uses, with `import-x/no-cycle` as an
  error.
- `tools` becomes a workspace package, `pedalboards-tools`, to hold that ESLint away from the
  root. Its tests stay root scripts, and its code keeps importing commitlint from the root.
- The core service also turns on `indent` with tabs. The rule is deprecated, but the code already
  follows it, and it is the only way to check this convention without one more package.
- The modules of the Workers runtime (`cloudflare:*`) are exempt from `import-x/no-unresolved`,
  since no resolver finds them on disk.
- The root `pnpm lint` runs the three `lint` scripts.

## Alternatives considered

- **One `eslint.config.mjs` at the root**: it needs ESLint in the root `node_modules`, which the
  preflight check of the CMS refuses. Rejected until the CMS leaves Create React App
  ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).
- **A config in the core service that also lints `../tools`**: ESLint skips a file outside the
  folder of its config, with the warning `File ignored because outside of base path`. Rejected.
- **`@stylistic/eslint-plugin` for the tabs**: one more dependency for a single rule. Rejected
  while ESLint 9 still ships `indent`.

## Consequences

- The tools are one more package to keep up to date; Dependabot reads it from
  `pnpm-workspace.yaml`, and the `eslint` group covers its `eslint` and `@eslint/js`.
- ESLint 11 is due to remove `indent`: the core service then needs `@stylistic/eslint-plugin` or
  no tab check.
- `commitlint.config.mjs` and the other files of the root stay out of the lint.
- The CI does not run these two lints yet: `.github/workflows` changes in a later pull request of
  [#191](https://github.com/AIssoufi/pedalboards/issues/191).
