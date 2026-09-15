# Work Items — Types, Fields and Links

Read this before creating or updating anything in Azure Boards.

---

## Resolve the type before using it

Work item type names depend on the project's process. Never assume them: read
what the project actually exposes, and map to the closest available type rather
than silently creating something else.

| Level | Agile | Scrum | CMMI | Basic |
|---|---|---|---|---|
| Portfolio | Epic | Epic | Epic | Epic |
| Change | Feature | Feature | Feature | — |
| Requirement | User Story | Product Backlog Item | Requirement | Issue |
| Work | Task | Task | Task | Task |

The requirement level is the *Requirements category* of the process. Query the
category rather than the name where the integration allows it — that is what
makes the same procedure work on all four processes.

Basic has no Feature level. On a Basic project, a change becomes a single Issue
and its requirements become the checklist in the description; say so instead of
inventing a hierarchy the project cannot hold.

## What a change creates

| Item | When | Parent |
|---|---|---|
| Epic | Only when the change spans several Features | — |
| Feature | The change itself, when it has more than one requirement | Epic, if any |
| Requirement-category item | One per delta | The Feature, when there is one |
| Task | One per checklist entry, created at apply time only | Its requirement |
| Test Case | One per scenario, only when `spec_store` is `testplans` | Linked, not parented |

## Fields

Write each section into its native field. Never dump everything into the
description — a work item whose acceptance criteria live in the description is
invisible to every board, query and report that looks for them.

**All types**

| Content | Field |
|---|---|
| Title | `System.Title` |
| Body | `System.Description` (HTML) |
| Capability | `System.AreaPath` |
| Sprint | `System.IterationPath` |
| Tags | `System.Tags` — always includes `azdospec` |
| Owner | `System.AssignedTo` |

**Requirement-category item**

| Content | Field |
|---|---|
| Scenarios, in Gherkin | `Microsoft.VSTS.Common.AcceptanceCriteria` |
| Why it matters | `Microsoft.VSTS.Common.BusinessValue` |
| Estimate | `Microsoft.VSTS.Scheduling.Effort` (Scrum), `…StoryPoints` (Agile), `…Size` (CMMI) |

**Task**

| Content | Field |
|---|---|
| Estimate in hours | `Microsoft.VSTS.Scheduling.RemainingWork` |

## Links

| Relationship | Reference name |
|---|---|
| Parent → child | `System.LinkTypes.Hierarchy-Forward` |
| Child → parent | `System.LinkTypes.Hierarchy-Reverse` |
| Must finish first | `System.LinkTypes.Dependency-Reverse` (Predecessor) |
| Follows | `System.LinkTypes.Dependency-Forward` (Successor) |
| Related | `System.LinkTypes.Related-Forward` |
| Verified by a test | `Microsoft.VSTS.Common.TestedBy-Forward` |

A work item holds at most 1000 links and 100 tags; long text fields hold up to
one million characters.

## Content per item

Keep each item to what its level is for. A change produces a tree, so an item
carrying every section a standalone work item could carry makes the tree
unreadable.

**Feature** — the problem, the outcome, and what is explicitly out of scope.
Business value in its field. No acceptance criteria: those belong to its
requirements.

**Requirement** — one user story (`As a… I want… so that…`), the scenarios as
Gherkin acceptance criteria, and the task checklist in the description while the
item is still proposed. One delta tag: `ADDED`, `MODIFIED` or `REMOVED`.

**Task** — what to do and where, in one or two sentences. No acceptance
criteria; the requirement owns those.

## Delta tags

Every requirement carries exactly one, and archive reads it to know what to do
with the spec:

| Tag | Means | On archive |
|---|---|---|
| `ADDED` | Behaviour that does not exist yet | Added to the spec |
| `MODIFIED` | Behaviour that exists and changes | Replaces what the spec says |
| `REMOVED` | Behaviour that goes away | Retired from the spec |

A `MODIFIED` or `REMOVED` requirement must identify what it supersedes, or
archive cannot apply it. It carries both of these whenever it can:

- **The link** — a `Related` link, typed as the table above spells it, to the
  Done requirement that put the behaviour in the spec. This is the identity:
  archive resolves by it first, and it survives every rewording of the spec.
- **The prose** — the scenario or requirement as the spec states it today.
  Always present: it is what a reader sees during refinement, and it is what
  archive resolves by when there is no work item to link. A spec written before
  azdospec, or imported from a wiki, has nothing to link to.

Where the two disagree, the link wins and archive reports the drift.

## Idempotency

Before creating anything, search the project for an open item with the same
title and the `azdospec` tag. If one exists, update it instead of creating a
duplicate, and tell the user you did.
