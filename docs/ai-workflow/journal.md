# Journal

The trail of every decision is on GitHub, where anyone can read it.

## Where to look

| Question | Where the answer is |
| --- | --- |
| Why does this change exist? | The issue, with its context, evidence and acceptance criteria |
| Was the scope changed later? | The comments of the issue ("Added to this ticket", "Added scope") |
| What is planned next? | The `Priority` and `Status` fields of the [project board](https://github.com/users/AIssoufi/projects/11) |
| How was it tested and reviewed? | The `Test plan` and `Review` sections of the pull request body |
| Did the checks pass? | The `CI` and `Commit messages` runs of the pull request, in the Actions tab |
| Which ticket brought this line? | `git log` or `git blame`, then the `Refs: PEDAL-<n>` trailer of the commit |
| Why was this tool chosen? | The decision records of [`docs/decisions`](../decisions) and [`docs/evolution.md`](../evolution.md) |

## Following one ticket

Issue [#47](https://github.com/AIssoufi/pedalboards/issues/47) asked for a ticket reference in
every commit message. Its pull request [#49](https://github.com/AIssoufi/pedalboards/pull/49)
holds three commits, each with `Refs: PEDAL-47`, and the decision record
[0002](../decisions/0002-commit-message-checks.md). Its merge commit closes the issue.

To list the commits of a ticket:

```sh
git log --grep='Refs: PEDAL-47'
```

## Findings

A problem that a worker finds outside its ticket becomes an issue that names where it was found.
[#79](https://github.com/AIssoufi/pedalboards/issues/79) starts with "Found while writing the root
`CLAUDE.md` (#72)", and the root `CLAUDE.md` lists it among the known gaps.

## The log of agent actions

The agents also keep a log of their actions on the maintainer's machine: which agent started,
which pull request it opened, which one was merged. It is not published; everything a reader
needs to follow a change is on GitHub.
