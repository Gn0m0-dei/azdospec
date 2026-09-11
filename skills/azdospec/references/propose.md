# Propose — Turn an Idea Into a Change

Produces the work items a change needs, as one draft with one approval.

---

## 1. Read the current spec

Identify which capabilities the idea touches, then read what the spec store says
about them today. A proposal written without reading the current behaviour
produces `ADDED` requirements for things that already exist.

| Store | Where to read |
|---|---|
| `testplans` | Test cases of the suite for that Area Path |
| `wiki` | The page for that Area Path |
| `epic` | The description of the capability Epic |
| `none` | Requirement-category items under that Area Path in a Done state |

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
what each `MODIFIED` or `REMOVED` supersedes in the current spec.

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
`azdospec` tag before creating each one.

Order matters: create the Feature first so the requirements can be parented to
it in the same pass. Then apply the links — hierarchy first, then `Related` for
cross-capability requirements, then `Predecessor / Successor` between
requirements that must land in order.

When the spec store is `testplans`, create one test case per scenario in the
`Design` state, in the suite for its Area Path, linked to its requirement with
`Microsoft.VSTS.Common.TestedBy-Forward`. They stay in `Design` until archive
accepts them.

## 6. Report

Give every item its ID and URL, the shape of the tree, and what to do next: the
change is in `New` and needs a product owner to approve it and put it in a
sprint before `/azdo:apply` will touch it.

---

## Hard rules

1. Nothing is created before the user approves the draft. A blanket "don't ask me" does not waive this — condense the draft to titles, types, destination and acceptance criteria, and ask for a one-word go-ahead.
2. Never invent a requirement, a scenario or a scope boundary.
3. Never substitute a work item type silently. If the intended type does not exist in the process, say so and propose the mapping.
