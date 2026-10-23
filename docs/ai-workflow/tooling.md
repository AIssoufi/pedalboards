# Tooling

The tools the agents use to work on this repository in parallel. Their versions and the shared
details of the setup are on the
[Tooling page](https://github.com/AIssoufi/AIssoufi/blob/main/docs/agentic-architecture/tooling.md)
of the agentic architecture docs. This page covers what is specific to this repository.

## Claude Code

[Claude Code](https://claude.com/claude-code) runs every agent: the master, the workers and the
reviewers. Claude Code loads the root [`CLAUDE.md`](../../CLAUDE.md) into every session, so it
holds the conventions and the pitfalls that the code does not show, one line each.

## cmux

[cmux](https://github.com/manaflow-ai/cmux) is the terminal: one workspace per agent, named after
its ticket (`PEDAL-47`), and the messages between the master and its workers.

## Worktrunk

[Worktrunk](https://github.com/max-sixty/worktrunk) (`wt`) creates the Git worktree and the branch
of each ticket, and removes them after the merge. This repository has no Worktrunk hooks of its
own (no `.config/wt.toml`): a worker installs the workspace with
`pnpm install --frozen-lockfile`, as the [README](../../README.md#install) says.

## commitlint and the ticket reference

The `commit-msg` hook of husky runs commitlint on each commit, and the `prepare-commit-msg` hook
adds the `Refs: PEDAL-<n>` trailer on a ticket branch
([#47](https://github.com/AIssoufi/pedalboards/issues/47),
[decision 0002](../decisions/0002-commit-message-checks.md)). The rule and the hook script are in
`tools/commit-messages`, tested with `node --test`. The `Commit messages` workflow checks the
commits and the title of each pull request again.

## The CI

The `CI` workflow runs on each pull request and each push to `master`
([#24](https://github.com/AIssoufi/pedalboards/issues/24),
[decision 0004](../decisions/0004-github-actions-ci.md)): lint, tests, builds and bundle checks of
the frontend, the CMS and the core service, as the [README](../../README.md#continuous-integration)
lists them. A worker runs the same scripts before its review.

## Cloudflare

Cloudflare Pages builds a preview of each branch, used by the visual test, and deploys `master` to
the live site; the API runs as a Cloudflare Worker on D1
([#27](https://github.com/AIssoufi/pedalboards/issues/27),
[decision 0005](../decisions/0005-cloudflare-pages-and-d1-worker.md)).
