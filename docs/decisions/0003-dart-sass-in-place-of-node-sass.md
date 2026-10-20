# 0003. Compile the styles with Dart Sass in place of node-sass

- Date: 2026-10-20
- Status: Accepted

## Context

- The frontend and the CMS write their styles in Sass (`.scss`), which Create React App 2 compiles
  through `sass-loader` 7. Since 2018, both apps declared `node-sass` 4, a binding of the LibSass
  C++ library that downloads a binary built for each Node.js version, or builds it from source.
- `node-sass` 4 has no binary for Node.js 24, and its build from source needs `node-gyp` 3, which
  needs Python 2. So `npm ci` failed in both apps on the current Node.js LTS, and nothing else
  (tests, build, a CI) could run on it.
- LibSass, and `node-sass` with it, are deprecated: the Sass team develops only Dart Sass.
- `sass-loader` 7 calls `require("node-sass")` and has no option to choose another compiler.

## Decision

- Both apps install Dart Sass (the `sass` package, pure JavaScript) under the name `node-sass`,
  with an npm alias: `"node-sass": "npm:sass@^1.105.1"`. `sass-loader` 7 loads it as if it were
  `node-sass`, and no `.scss` file changes.
- Made in commit `4e6e8f88` of pull request
  [#39](https://github.com/AIssoufi/pedalboards/pull/39), for issue
  [#24](https://github.com/AIssoufi/pedalboards/issues/24).

## Alternatives considered

- **Keep `node-sass` on an older Node.js**: its last Node.js versions with a binary reached their
  end of life, and they would have kept the whole repository off the current LTS.
- **Upgrade `node-sass`**: its later versions still depend on LibSass and on a native build for
  each Node.js version, and the package is deprecated.
- **Upgrade Create React App, or leave it, to get a loader that accepts the `sass` package**: a
  migration of the build tool, too large for a fix that only had to make the apps install. It is
  planned on its own ([#33](https://github.com/AIssoufi/pedalboards/issues/33) for the frontend,
  [#45](https://github.com/AIssoufi/pedalboards/issues/45) for the CMS).

## Consequences

Counted from the npm lockfiles of the frontend and the CMS before (`7e3f5272`) and after
(`638b73b6`) the pull request. The advisories come from `npm audit --package-lock-only`, run on
both commits on the same day with the same advisory database:

| Figure | Before (node-sass) | After (Dart Sass) |
| --- | --- | --- |
| `npm ci` on Node.js 24 | fails | passes |
| Packages in the lockfile, frontend / CMS | 2,326 / 2,168 | 2,302 / 2,142 |
| `npm audit` vulnerable packages, frontend / CMS | 244 / 239 | 236 / 231 |
| Distinct advisories of the four npm lockfiles | 250 | 246 |
| Compiled CSS of both apps | reference | byte-identical |
| Build time | not measured: the apps do not install on Node.js 24 | see [0001](0001-pnpm-workspaces-and-node-24.md) |

- The CSS comparison is the one of pull request #39: `master` built with `node-sass` on Node.js 8,
  compared file by file with the build of the branch.
- No native module is built for Sass any more, so a new Node.js version no longer waits for a
  `node-sass` binary.
- The alias hides the real package: `package.json` reads `node-sass` while the code is Dart Sass.
  It goes away with Create React App, when the apps call the `sass` package directly.
