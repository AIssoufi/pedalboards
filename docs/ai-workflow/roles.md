# Roles

Three kinds of actors work on this repository. Each one decides a different kind of thing.

## The owner

The human owner of the repository, ADAM Issoufi, decides:

- what a visitor sees or reads: a change of layout, of copy or of language;
- rewrites and new features;
- the open questions that the agents cannot settle from the code, the issue or a convention.

A pull request that changes what a visitor sees stays open until the owner approves it. Its body
describes the screenshots taken before and after the change, at a phone width (390 px) and a
desktop width (1280 px). Issue [#30](https://github.com/AIssoufi/pedalboards/issues/30) shows the
pattern: [#76](https://github.com/AIssoufi/pedalboards/pull/76) fixed what changes nothing on
screen and was merged, while [#78](https://github.com/AIssoufi/pedalboards/pull/78), the visible
fixes, waits for the owner, and a comment of the issue asks the owner to choose one language per
app.

## The master agent

One master agent coordinates the repository. It:

- sets the `Priority` of each issue on the project board, from `P0` to `P3`;
- writes the new issues, with their context, problem, proposed solution and acceptance criteria;
- starts a worker for each ticket ready to go, with a short brief;
- answers the questions of the workers, or relays them to the owner;
- turns the findings of the workers into new issues, or adds them to an open one as a comment;
- merges each pull request once its checks are green and the owner has approved what needs it.

## The workers

A worker agent delivers one ticket, in its own Git worktree on the branch named after the
ticket. It implements the acceptance criteria, writes the tests, runs the checks of the CI,
reviews its work and opens the pull request. It never merges.

A worker stays inside its ticket. Anything else it notices (a bug, debt, a missing test) goes to
the master as a finding, never as a fix on the way or as an issue of its own. Issue
[#79](https://github.com/AIssoufi/pedalboards/issues/79) is such a finding, made while writing the
root `CLAUDE.md` for [#72](https://github.com/AIssoufi/pedalboards/issues/72).

## Reviewer agents

Short-lived agents review a worker's change before its pull request: see [Reviews](reviews.md).
