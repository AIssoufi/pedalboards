# 0008. Lint the frontend with ESLint 9 and its recommended presets

- Date: 2026-10-21
- Status: Accepted

## Context

- The frontend had a `.eslintrc.js` that extended `airbnb` and `react-app`, but no `lint`
  script, and the CI did not lint it. Its plugins no longer matched the code: the
  `react-app` preset came from Create React App, which the frontend left for Vite
  ([0006](0006-vite-and-vitest.md)), and its import resolver looked up `src` as a module
  folder that no import uses.
- `eslint-config-airbnb` has no flat config and declares ESLint 7 or 8 as its peer. ESLint 8
  reached its end of life in October 2024, and ESLint 9 reads only the flat config by default.
- Run by hand, `eslint --ext .js,.jsx src` reported 48 problems in the frontend, 7 of them
  `import/no-cycle`: the `components` barrel imports the plugin grid, which imported its card
  from that barrel, and such a cycle had already broken a test suite
  ([#28](https://github.com/AIssoufi/pedalboards/issues/28)).
- The CMS still builds with Create React App 2.1.1, whose preflight check refuses any ESLint
  other than its own 5.6.0 found above `react-scripts` in `node_modules`.

## Decision

- The frontend lints with ESLint 9 and a flat `eslint.config.mjs` built from the recommended
  presets of each tool: `@eslint/js`, `eslint-plugin-react` with its JSX runtime preset,
  `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` and `eslint-plugin-import-x`.
  `import-x/no-cycle` is an error. Vitest globals apply to the test files, Node.js globals to
  the scripts and configuration files.
- `pnpm lint` runs `eslint . --max-warnings 0`, from the frontend or the root, and the CI runs
  it before the tests of the frontend.
- `eslint-plugin-import-x` replaces `eslint-plugin-import`, and `unrs-resolver`, its native
  resolver, has no install script to run (`allowBuilds`).
- `pnpm-workspace.yaml` keeps ESLint out of the hoisted `node_modules/.pnpm/node_modules`
  (`hoistPattern: ['*', '!eslint']`), where the preflight check of the CMS found the ESLint 9
  of the frontend and stopped its build.
- The CMS gets no lint until it leaves Create React App
  ([#45](https://github.com/AIssoufi/pedalboards/issues/45)).

## Alternatives considered

- **Keep airbnb through `FlatCompat`**: its peer dependency stops at ESLint 8, and it brings
  hundreds of formatting rules, such as `react/require-default-props`, that the project does
  not follow. Rejected.
- **ESLint 10**: `eslint-plugin-react` 7.37.5 and `eslint-plugin-jsx-a11y` 6.10.2, their last
  releases, declare peers up to ESLint 9 only. Rejected until they support it.
- **`eslint-plugin-import`**: its `tsconfig-paths` dependency installs releases of `json5` and
  `minimist` with known advisories. `eslint-plugin-import-x` has the same rules without them.
- **A lint of the CMS with ESLint 9**: pnpm's compatibility database gives `react-scripts`
  2.1.1 a peer `eslint: '*'`, so an ESLint 9 in the CMS replaces the ESLint 5 of
  `react-scripts`, and its preflight check fails both `start` and `build`.
  `SKIP_PREFLIGHT_CHECK=true` would hide the check, but CRA 2 would then lint with ESLint 9
  and a config it does not know. Rejected.

## Consequences

- `pnpm lint` exits 0 in the frontend, and the CI keeps it so. No import cycle can come back.
- The formatting rules of airbnb are gone: the style of the code is no longer checked
  (indentation, quotes, line length), only its correctness.
- The React Compiler rules of `eslint-plugin-react-hooks` 7 apply: an effect does not set a
  state synchronously, and a render does not read a ref.
- With JSX runtime, the `import React` lines that only served JSX are gone.
- The `.eslintrc.js` and the airbnb dependencies of the CMS stay unused until #45.
