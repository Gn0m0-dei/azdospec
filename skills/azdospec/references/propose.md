# Propose — Turn an Idea Into a Change

Produces the work items a change needs, as one draft with one approval.

---

## 1. Read the current spec

Identify which capabilities the idea touches, then read what the spec store says
about them today. A proposal written without reading the current behaviour
produces `ADDED` requirements for things that already exist.

| Store | Where to read |
|---|---|
| `testplans` | Test cases of the suite for that Area Path — `az rest` on `testplan/Plans/<plan>/Suites/<suite>/TestCase`, then `az boards work-item show` on each |
| `wiki` | `az devops wiki page show --wiki <wiki> --path "<area path>" --include-content --query content -o tsv` |
| `epic` | `az boards work-item show --id <epic> --query 'fields."System.Description"' -o tsv` |
| `none` | `az boards query --wiql` for Done requirement-category items `UNDER` that Area Path |

When the capability is new, say so — the whole change is then `ADDED`, and
propose will create the Area Path.

## 2. Ask what is missing

Do not invent requirements, acceptance criteria or scope. What you need before
drafting:

- The problem, concretely enough to write a testable scenario.
- Who it is for, and what changes for them.
- What is explicitly out of scope.
- Anything the change depends on that does not exist yet.

Group every question into one numbered message. A confident draft built on
guesses is the worst possible outcome: it reads as settled and is wrong.

## 3. Shape the tree

Decide the delta for each requirement — `ADDED`, `MODIFIED` or `REMOVED` — and
what each `MODIFIED` or `REMOVED` supersedes in the current spec. Search the
project for the Done requirement that put that behaviour there and link it;
where none exists, name it in prose alone.

Then pick the shape:

| Requirements | Shape |
|---|---|
| One | A single requirement-category item, no Feature |
| Several | A Feature with one requirement per delta |
| Spanning capabilities | A Feature under the primary capability; requirements carry their own Area Path and a `Related` link to the secondary one |

Do not create a Feature to hold a single requirement. An extra level nobody
needed still has to be read, closed and reported on forever.

Write the tasks as a checklist in each requirement's description, not as work
items. Tasks are created by `apply`, once the item is committed to a sprint —
creating them now fills the sprint backlog with work nobody has planned.

## 4. Draft

Follow `work-items.md` for types, fields and content per level.

Present the whole tree as a single draft: the Feature, every requirement with its
delta tag and Gherkin acceptance criteria, the task checklist, and the
destination — project, area path, iteration or backlog, parent. State anything
you assumed rather than confirmed.

Then ask for approval, and offer to adjust.

## 5. Create

Only after approval. Search for an existing item with the same title and the
`azdospec` tag before creating each one, with the query in `work-items.md`.

A new capability needs its Area Path first:

```bash
az boards area project create --name "<capability>" --path "\\$PROJECT\\Area\\<area root>"
```

Order matters: create the Feature first and keep its id, so the requirements can
be linked to it in the same pass. Then apply the links — `Parent` on each
requirement, then `Related` for cross-capability requirements and for what a
`MODIFIED` or `REMOVED` supersedes, then `Predecessor` on the requirement that
waits. `work-items.md` has the commands.

When the spec store is `testplans`, create one `Test Case` work item per
scenario in the `Design` state, in the requirement's Area Path, then add them to
the suite for that Area Path and link each requirement `Tested By` its cases:

```bash
printf '[{"workItem": {"id": %s}}]' <case-id> > cases.json
az rest --resource 499b84ac-1321-427f-aa17-267ca6975798 --method post \
  --url "$ORG/$PROJECT/_apis/testplan/Plans/<test_plan_id>/Suites/<suite-id>/TestCase?api-version=7.1" \
  --body @cases.json
```

A capability with no suite yet gets one, a `staticTestSuite` named for the Area
Path under the plan's root suite, by posting to `testplan/Plans/<test_plan_id>/suites`.
They stay in `Design` until archive accepts them.

## 6. Report

Give every item its ID and URL, the shape of the tree, and what to do next: the
change is in `New` and needs a product owner to approve it and put it in a
sprint before `/azdo:apply` will touch it.

---

## Hard rules

1. Nothing is created before the user approves the draft. A blanket "don't ask me" does not waive this — condense the draft to titles, types, destination and acceptance criteria, and ask for a one-word go-ahead.
2. Never invent a requirement, a scenario or a scope boundary.
3. Never substitute a work item type silently. If the intended type does not exist in the process, say so and propose the mapping.
