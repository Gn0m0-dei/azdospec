# Spec Stores

The spec store is where the merged, living specification of each capability
lives. `/azdo:init` picks one; you can override it.

The choice exists because the best option needs a licence not every organization
has, and a tool that assumed it would be unusable for most teams.

---

## `testplans`

**Needs:** Basic + Test Plans, for the identity the integration runs as.

Each scenario becomes a Test Case: `Design` while proposed, `Ready` once
archived, `Closed` when removed. Test cases are grouped in a suite per Area Path
and linked to their requirement with `Tests / Tested By`.

This is specification by example — the spec is executable, and the link from
requirement to verification is native. It is also the only store where merging a
delta is a structural operation rather than rewriting a block of text: a
`MODIFIED` requirement edits the test case it supersedes, and the revision
history shows the diff.

Choose it if your team already lives in Test Plans. Note that creating test cases
is itself gated by the licence, not only creating plans and suites.

## `wiki`

**Needs:** Basic.

One wiki page per Area Path, rewritten on archive. The page states current
behaviour — no changelog section, no "as of version X"; the wiki's own revision
history records how it got there.

The default when Test Plans is unavailable, and the best store for reading: full
Markdown, real diffs, and a link type that connects pages to work items.

## `epic`

**Needs:** Basic.

One long-lived Epic per Area Path, holding the spec in its description. The
description field holds up to a million characters, and the work item History tab
gives you revisions with diffs for free.

Everything stays inside Boards, which some teams prefer. The cost is a backlog
item that never closes, which distorts portfolio boards and rollups — see
[how it maps](./how-it-maps.md#why-capabilities-are-area-paths). Opt in
deliberately.

## `none`

**Needs:** nothing.

No merged spec. `/azdo:archive` closes the change and stops; the agent reads the
Done requirements of the Area Path when it needs context.

Honest about what it is: a changelog, not a specification. Useful for trying the
workflow out, or for a team that keeps its specs somewhere else entirely.

---

## Changing your mind

Edit `spec_store` in `.azdospec.json`. Nothing migrates automatically — what is
already in the old store stays there. Moving a capability's spec by hand is a
one-off job and usually worth doing before the next `/azdo:archive`.
