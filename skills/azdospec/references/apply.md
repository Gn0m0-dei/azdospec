# Apply — Implement an Approved Change

Turns an approved requirement into tasks, a branch, commits and a pull request.

---

## 1. Check readiness

```bash
az boards work-item show --id <id> \
  --query '{state: fields."System.State", iteration: fields."System.IterationPath"}' -o tsv
```

Refuse to start unless the requirement is:

- In a state at or beyond `Approved` — `Approved` or `Committed` in Scrum,
  `Active` in Agile — meaning a product owner has accepted it.
- Assigned to an iteration below the project root.

Say which condition fails and who resolves it. This is not bureaucracy: an item
nobody has prioritised and nobody has scheduled is not ready to be built, and
building it anyway is how a backlog stops meaning anything.

A requirement in `New` is a draft. Offer to walk the user through what it still
needs, not to bypass the gate.

## 2. Create the tasks

Read the checklist from the requirement's description and create one Task per
entry, in the requirement's Area Path and iteration, then link each one `Parent`
to the requirement.

Link tasks that must run in order with `Predecessor` on the one that waits.
Everything left unlinked can run in parallel — that is how the streams below are
derived, so leaving a real dependency unlinked costs you a conflict later.

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

Name it for the item and push it:

```
feature/AB<id>-<slug>
```

The link from branch to item is made by the commits and the pull request below,
not by the branch itself.

## 5. Implement

Reference the work item in every commit so the chain survives:

```
<type>: <summary>

AB#<id>
```

Post a progress comment on the requirement at each milestone — a stream
finished, a decision taken, a blocker hit — with
`az boards work-item update --id <id> --discussion "<html>"`. Never more than
one comment every five minutes; a work item nobody can read is as bad as no work
item.

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

```bash
az repos pr create --repository <repository> \
  --source-branch feature/AB<id>-<slug> --target-branch main \
  --title "<title>" --description "AB#<id>" "<what it does>" \
  --work-items <id> <task ids…> --transition-work-items true \
  --query "{id: pullRequestId, url: url}" -o tsv
```

`--work-items` is what satisfies the branch policy; `--transition-work-items`
is what makes merging close the tasks rather than leaving someone to tick them
by hand.

## 7. Report

Give the pull request URL, which tasks it closes, and what remains before
`/azdo:archive` — every task Done, and the pull request merged.
