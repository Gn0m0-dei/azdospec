# Apply — Implement an Approved Change

Turns an approved requirement into tasks, a branch, commits and a pull request.

---

## 1. Check readiness

Refuse to start unless the requirement is:

- In a state at or beyond `Approved` — `Approved` or `Committed` in Scrum,
  `Active` in Agile — meaning a product owner has accepted it.
- Assigned to an iteration.

Say which condition fails and who resolves it. This is not bureaucracy: an item
nobody has prioritised and nobody has scheduled is not ready to be built, and
building it anyway is how a backlog stops meaning anything.

A requirement in `New` is a draft. Offer to walk the user through what it still
needs, not to bypass the gate.

## 2. Create the tasks

Read the checklist from the requirement's description and create one Task per
entry, parented to the requirement, in the same iteration.

Link tasks that must run in order with `System.LinkTypes.Dependency-Reverse`
from the one that waits. Everything left unlinked can run in parallel — that is
how the streams below are derived, so leaving a real dependency unlinked costs
you a conflict later.

Replace the checklist in the description with nothing: the tasks are the
checklist now, and two copies of the same list diverge within a day.

## 3. Derive the streams

Group the tasks into streams that touch different files and have no dependency
between them. Each stream is independent work that can proceed concurrently.

State the streams before starting. When there is only one, say so and work
normally — a worktree for a single stream is overhead with no payoff.

With two or more streams, create a worktree per stream so concurrent work does
not collide:

```bash
git worktree add ../<repository>-<stream> -b <branch>/<stream>
```

## 4. Create the branch

Create the branch from the work item so Azure DevOps records the link, and name
it for the item:

```
feature/AB<id>-<slug>
```

## 5. Implement

Reference the work item in every commit so the chain survives:

```
<type>: <summary>

AB#<id>
```

Post a progress comment on the requirement at each milestone — a stream
finished, a decision taken, a blocker hit. Never more than one comment every
five minutes; a work item nobody can read is as bad as no work item.

```markdown
## Progress — <date>

### Done
### In progress
### Notes
### Acceptance criteria
### Next
### Blockers
```

Keep analysis, stream plans and working notes local. Azure DevOps gets
milestones, not a transcript.

## 6. Open the pull request

Title the pull request for the work item and reference `AB#<id>` in its
description so the branch policy is satisfied.

Enable transitioning linked work items on completion, so merging closes the
tasks rather than leaving someone to tick them by hand.

## 7. Report

Give the pull request URL, which tasks it closes, and what remains before
`/azdo:archive` — every task Done, and the pull request merged.
