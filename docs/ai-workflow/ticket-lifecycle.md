# Ticket lifecycle

How an issue becomes a merged pull request. The `Status` field of the maintainer's private
project board follows each step: `Todo`, `In Progress`, `In Review`, `Done`. A reader follows
the same steps on the public [issues](https://github.com/AIssoufi/pedalboards/issues) and
[pull requests](https://github.com/AIssoufi/pedalboards/pulls).

## 1. The issue

The master writes the issue, or turns a finding into one, and sets its `Priority` (`P0` to
`P3`). An issue holds its context, the problem with its evidence, a proposed solution and its
acceptance criteria. Scope found later is added as a comment that starts with "Added to this
ticket" or "Added scope", as on [#30](https://github.com/AIssoufi/pedalboards/issues/30).

## 2. The worker and its branch

The master starts a worker on the ticket: a new Git worktree on a branch named after the ticket
(`PEDAL-47` for issue #47), started from `master`. The status moves to `In Progress`.

## 3. The commits

The worker makes small Conventional Commits. Each one ends with a `Refs: PEDAL-<n>` trailer,
which the `prepare-commit-msg` hook adds on a ticket branch and commitlint requires
([decision 0002](../decisions/0002-commit-message-checks.md)). Corrections after a review are
`fixup!` commits, folded before the merge. To bring in the latest `master`, the worker rebases its
branch: a work branch holds no merge commit.

## 4. The pull request

After its review (see [Reviews](reviews.md)), the worker opens a pull request against `master`.
Its title is a Conventional Commit, its body holds a summary, a test plan, the review verdict and
`Closes #<n>`. The status moves to `In Review`. A large ticket may take two pull requests, the
second one holding the changes the owner must see, as #30 did with
[#76](https://github.com/AIssoufi/pedalboards/pull/76) and
[#78](https://github.com/AIssoufi/pedalboards/pull/78).

## 5. The checks

Each pull request runs two GitHub Actions workflows. `CI` runs the tests and the build of the
three apps, the lint of the frontend, the bundle checks of the frontend and the API, and the dev
server check of the frontend. `Commit messages` tests the commit message tools, then runs
commitlint on every commit and on the title.
Cloudflare Pages builds a preview of the branch and posts its URL as a comment. A failure is fixed
on the branch by the worker.

## 6. The merge

The master merges with a merge commit whose body is only `Closes #<n>`, for instance
`Merge pull request #80 from AIssoufi/PEDAL-72`, or `Refs #<n>` for the first pull request of a
ticket that takes two, as #76 did. The issue closes and the status moves to `Done`. Cloudflare
Pages deploys `master` to the live site, and Workers Builds deploys the API from `master`.
