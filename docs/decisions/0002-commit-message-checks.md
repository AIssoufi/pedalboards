# 0002. Check the commit messages with commitlint and husky

- Date: 2026-10-20
- Status: Accepted

## Context

- The commits follow [Conventional Commits](https://www.conventionalcommits.org/) and name their
  ticket in a `Refs: PEDAL-<number>` trailer, which the GitHub autolink of the repository turns
  into a link to the issue. Nothing checked it: a commit without the trailer, or with a header
  that is not conventional, reached `master` as easily as any other.
- Of the 67 commits of `master` that are not merges, 18 name a ticket. In 3 of them, `Refs:` sits
  in a paragraph of its own above `Co-Authored-By`, where `git interpret-trailers --parse` does
  not read it as a trailer. The 46 commits written before the convention name no ticket and have
  no conventional header.
- Dependabot opens pull requests whose commits and titles are not conventional
  (`Bump pbkdf2 from 3.0.17 to 3.1.7 in /pedalboards-frontend`), and merge commits are written by
  git or GitHub.

## Decision

- [commitlint](https://commitlint.js.org/) 21 checks every message against
  `@commitlint/config-conventional`, whose header and body lines stay within 100 characters, and
  against a rule of the repository, `ticket-reference-exists`
  ([`tools/commit-messages`](../../tools/commit-messages)):
  - the rule reads the trailers with `git interpret-trailers --parse`, as git does, so the
    reference belongs in the last paragraph, next to `Co-Authored-By`;
  - it also accepts the older layout, where a blank line follows `Refs:`;
  - merge, revert, `fixup!` and `squash!` commits, the commits signed off by a bot and the release
    commits of release-please are ignored.
- [husky](https://typicode.github.io/husky/) 9 installs two hooks through the `prepare` script of
  the root `package.json`:
  - `prepare-commit-msg` adds `Refs: <branch>` on a ticket branch, such as `PEDAL-47`, above
    `Co-Authored-By`, unless a line of the message already starts with `Refs:`, or the commit is
    a merge or a `fixup!` commit;
  - `commit-msg` runs commitlint.
- The commit messages workflow runs the tests of these tools, then commitlint on the commits of
  each pull request and on its title. The title skips the ticket rule, since the body of the pull
  request gives `Closes #<number>`, and ignores nothing, not even `Merge …`. The titles of the
  pull requests of bots are skipped.
- The existing history is not rewritten.
- Made for issue [#47](https://github.com/AIssoufi/pedalboards/issues/47), in pull request
  [#49](https://github.com/AIssoufi/pedalboards/pull/49).

## Alternatives considered

- **A hand-written `commit-msg` hook**: no new package, but the rules of Conventional Commits
  (types, header length, body lines) would have to be written and tested again.
- **lefthook**: its npm package installs the hooks from an install script of a dependency, which
  `allowBuilds` would have to allow.
- **simple-git-hooks**: it writes the hooks into `.git/hooks`, and has to run again after each
  change of its configuration, while husky only points `core.hooksPath` to the `.husky/_` folder
  of each checkout.
- **A third-party action for the pull requests, such as `wagoid/commitlint-github-action` or
  `amannn/action-semantic-pull-request`**: it would run another commitlint version, or other
  rules, than the hook, with access to the token of the workflow. The workflow runs the commitlint
  of the lockfile instead.

## Consequences

Measured on the same machine (macOS, Node.js 24.22.0, pnpm 12.14.0, git 2.56.0), with a warm
package cache:

| Figure | Before | After |
| --- | --- | --- |
| Packages installed | 1,603 | 1,669 |
| Direct dependencies | 45 | 50 |
| Lockfile lines | 14,794 | 15,349 |
| Install after deleting `node_modules` | 1.93 s | 2.18 s |
| Empty commit (`git commit --allow-empty`) | 0.02 s | 0.35 s |
| Audit advisories, critical / high / moderate / low | 28 / 112 / 72 / 25 | 28 / 112 / 72 / 25 |
| Tests of the commit message tools | none | 115, all passing |
| CI workflow run | 35 s | 34 s |
| Commit messages workflow run, next to the CI workflow | none | 22 s |

- The install times are the medians of 5 runs of `/usr/bin/time -p pnpm install
  --frozen-lockfile`, alternating between a clone of `master` and a clone of this change, on a
  machine busy with other work. The commit times are the medians of 3 runs before and 5 after, in
  the same clones.
- The advisories come from `pnpm audit` of both lockfiles on the same day: the new packages add
  none. The advisory database has grown since [0001](0001-pnpm-workspaces-and-node-24.md), so its
  figures are lower.
- The CI figures come from GitHub: run 39387126349 of the last push to `master` before, and runs
  39391694904 and 39391695075 of pull request #49 after. Its Commit messages job takes 18 s,
  of which 1.8 s install the 79 packages of the root and 0.6 s run the 115 tests. The workflow
  runs next to the CI workflow and ends first, so the checks of a pull request take no longer.
- Each commit takes about 0.3 s more, to start Node.js twice.
- `pnpm install` sets `core.hooksPath` to `.husky/_` in the git configuration of the repository,
  which every worktree shares. The path is relative, so each worktree runs the hooks of its own
  `.husky/_` folder, which its own `pnpm install` creates. A worktree without it runs no hooks.
- `git commit --no-verify` skips the `commit-msg` check, and a commit made on a branch that is not
  a ticket, or on the detached HEAD of a rebase, needs the trailer written by hand. The workflow
  still checks every commit of a pull request.
- `git rebase` replays the commits without the hooks, except when a commit is reworded or
  amended, so older commits keep their layout.
- The key of the tickets, `PEDAL`, is one constant of `tools/commit-messages/constants.mjs`.
