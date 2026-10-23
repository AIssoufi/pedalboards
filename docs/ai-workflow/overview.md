# The AI agent workflow

This repository is maintained by AI coding agents
([Claude Code](https://claude.com/claude-code)) under the supervision of its owner. This folder
explains what the code cannot show: who decides what, how a ticket becomes a merged pull request,
what each review checks and where the trail is kept.

## In short

- Every change starts as a GitHub issue, whose number is its ticket reference: issue #47 is
  `PEDAL-47`, worked on the branch `PEDAL-47`.
- A master agent prioritizes the issues, writes new ones and gives each ticket to a worker agent.
- A worker implements one ticket in its own Git worktree, reviews its work with reviewer agents,
  and opens a pull request that closes the issue.
- The CI and a Cloudflare Pages preview run on each pull request, and the master merges it once
  every check is green. A change that a visitor can see waits for the owner.
- Each commit carries a `Refs: PEDAL-<n>` trailer, so `git log` links every line back to its
  issue.

## Why

- Many tickets move in parallel without stepping on each other: one worktree, one branch and
  one pull request per ticket.
- Nothing reaches `master` without an issue that says why, a review and a green CI.
- Problems found on the way become new issues instead of silent fixes in an unrelated pull
  request.

## The pages

| Page | What it covers |
| --- | --- |
| [Roles](roles.md) | The owner, the master agent and the workers, and who decides what |
| [Ticket lifecycle](ticket-lifecycle.md) | From an issue to a merged pull request |
| [Reviews](reviews.md) | The conventions review and the visual test of each pull request |
| [Journal](journal.md) | Where to find the trail of every decision |
| [Tooling](tooling.md) | The tools the agents work with on this repository |

The conventions the agents follow are in the root [`CLAUDE.md`](../../CLAUDE.md), and the
history of the stack in [`docs/evolution.md`](../evolution.md).
