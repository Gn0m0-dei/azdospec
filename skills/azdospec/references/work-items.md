# Work Items — Types, Fields, Links and Commands

Read this before creating or updating anything in Azure Boards.

Throughout, `$ORG` is `https://dev.azure.com/<organization>` and `$PROJECT` the
project, both from `.azdospec.json`. Every command takes `--org $ORG`, and every
command that accepts it takes `--project $PROJECT`; they are left out below.

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

The requirement level is the *Requirements category* of the process. Read it
rather than guessing the name — that is what makes the same procedure work on
all four processes:

```bash
az rest --resource 499b84ac-1321-427f-aa17-267ca6975798 \
  --url "$ORG/$PROJECT/_apis/wit/workitemtypecategories/Microsoft.RequirementCategory?api-version=7.1" \
  --query defaultWorkItemType.name -o tsv
```

Basic has no Feature level. On a Basic project, a change becomes a single Issue
and its requirements become the checklist in the description; say so instead of
inventing a hierarchy the project cannot hold.

## Reaching what the extension lacks

`az boards`, `az repos` and `az devops wiki` cover almost everything. Test Plans
and the Requirements category above have no command group; for those, call the
REST API with `az rest`. The `--resource` value is the Azure DevOps application
id, and it makes `az rest` sign the call with the same `az login` identity as
every other command — no token of its own:

```bash
az rest --resource 499b84ac-1321-427f-aa17-267ca6975798 --method post \
  --url "$ORG/$PROJECT/_apis/<route>?api-version=7.1" \
  --body @body.json
```

Write the body to a file. Nothing with HTML or quotes in it goes on the command
line.

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

### Writing them

```bash
az boards work-item create --type "<type>" --title "<title>" \
  --area "<area path>" --iteration "<iteration path>" \
  --fields "System.Tags=azdospec; ADDED" \
           "Microsoft.VSTS.Common.AcceptanceCriteria=<html>" \
           "System.Description=<html>" \
  --query id -o tsv
```

HTML fields go through `--fields` as one line each — `<div>…</div>` per
paragraph, no line breaks inside the value. Azure DevOps keeps the markup and
adds a space before each closing tag when it stores it; that is the server, not
you. Double quotes inside a value must be escaped for the shell, or replaced with
`&quot;`.

`az boards work-item update --id <id>` takes the same `--fields`, plus
`--state`, `--iteration`, `--assigned-to` and `--discussion "<html>"` for a
comment.

### Reading them

```bash
az boards work-item show --id <id> \
  --query '{state: fields."System.State", iteration: fields."System.IterationPath"}' -o tsv
```

`show` takes `--id` and `--org` only — no `--project`. Always `--query` the
fields you need.

## Links

| Relationship | `--relation-type` | Reference name |
|---|---|---|
| Parent → child | `Child` | `System.LinkTypes.Hierarchy-Forward` |
| Child → parent | `Parent` | `System.LinkTypes.Hierarchy-Reverse` |
| Must finish first | `Predecessor` | `System.LinkTypes.Dependency-Reverse` |
| Follows | `Successor` | `System.LinkTypes.Dependency-Forward` |
| Related | `Related` | `System.LinkTypes.Related` |
| Verified by a test | `Tested By` | `Microsoft.VSTS.Common.TestedBy-Forward` |

```bash
az boards work-item relation add --id <child> --relation-type Parent --target-id <parent>
```

The relation is read from the item given as `--id`: a requirement gets its
`Parent`, the task that waits gets its `Predecessor`, the requirement gets
`Tested By` its test case.

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

- **The link** — a `Related` link to the Done requirement that put the
  behaviour in the spec. This is the identity: archive resolves by it first, and
  it survives every rewording of the spec.
- **The prose** — the scenario or requirement as the spec states it today.
  Always present: it is what a reader sees during refinement, and it is what
  archive resolves by when there is no work item to link. A spec written before
  azdospec, or imported from a wiki, has nothing to link to.

Where the two disagree, the link wins and archive reports the drift.

## Idempotency

Before creating anything, search the project for an open item with the same
title and the `azdospec` tag. If one exists, update it instead of creating a
duplicate, and tell the user you did.

```bash
az boards query --wiql "SELECT [System.Id] FROM WorkItems
  WHERE [System.TeamProject] = @project
    AND [System.Tags] CONTAINS 'azdospec'
    AND [System.Title] = '<title>'
    AND [System.State] <> 'Done' AND [System.State] <> 'Removed'" \
  --query "[].id" -o tsv
```

An empty result prints nothing at all, not an empty list.
