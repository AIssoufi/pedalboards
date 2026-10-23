# Reviews

Before it opens a pull request, a worker has its committed change reviewed by reviewer agents.
They report findings; the worker fixes the confirmed ones in `fixup!` commits, then has the same
reviewer check those fixes once more.

## The conventions review

A read-only reviewer reads the diff against the conventions of the root
[`CLAUDE.md`](../../CLAUDE.md) and the coding rules of the agents. It checks, for instance:

- the layout: one folder per component, shared helpers in `src/utils/<name>/`;
- the code: named constants at module level, named-parameter objects, readable conditions,
  JSDoc;
- the tests: one per component and helper, with edge cases and bad values;
- the texts: English code and docs, no em dash in the UI or the README, the owner's name;
- the commits: Conventional Commits, the `Refs:` trailer, the ticket's scope and nothing else.

It reports each violation with its file, its line and the fix.

## The visual test

When something visible changes, a visual tester runs the app or opens the Cloudflare Pages
preview, and screenshots the changed pages before and after, at a phone width (390 px) and a
desktop width (1280 px) at least. It checks that each acceptance criterion is visible and works,
and sweeps for regressions: broken layout, console errors and failed requests. A pull request
with no visible change, such as this documentation, skips it.

## The verdict in the pull request

The `Review` section of the pull request body sums up both reviews: what was found, what was
fixed, what was not tested, and the findings sent on to other issues. The body of
[#78](https://github.com/AIssoufi/pedalboards/pull/78) is an example, with its axe-core runs and
its screenshots compared to the pixel.

## The checks of GitHub

The reviews come on top of the CI, not in place of it: the `CI` and `Commit messages` workflows
must pass on the last commit of the pull request before the master merges it (see
[Ticket lifecycle](ticket-lifecycle.md)).
