# Commands

Four commands, run in order. Each one refuses to do work that is not its own.

---

## `/azdo:init`

Runs once per repository.

Derives organization, project and repository from `git remote get-url origin` and
asks you to confirm — an organization holds many projects, and work items created
in the wrong one are tedious to undo. Proposes the Area Path your capabilities
will live under. Detects the spec store by trying to write a test plan. Configures
the `work-item-linking` branch policy. Writes `.azdospec.json`.

The branch policy needs the Azure CLI, because the MCP server does not expose
branch policies. If it is unavailable, init says so and points you at project
settings rather than pretending it succeeded.

## `/azdo:propose <idea>`

Reads the current spec for the capabilities your idea touches, asks about what it
cannot infer, and drafts the change.

You get one draft for the whole tree and one approval — not a walkthrough per
work item. The draft shows the Feature, every requirement with its delta tag and
Gherkin acceptance criteria, the task checklist, and exactly where it will be
created.

**It will not:** invent a requirement, an acceptance criterion or a scope
boundary; create anything before you approve; substitute a work item type your
process does not have without telling you.

Tasks are *not* created here. They are a checklist in the description until the
change reaches a sprint.

## `/azdo:apply`

Implements an approved change.

**It refuses** unless the requirement has been approved by a product owner and
assigned to an iteration, and it tells you which condition is missing. An item
nobody prioritised and nobody scheduled is not ready to be built.

When it is ready: creates the tasks, links the ones that must run in order,
derives the independent streams from those links, creates the branch from the
work item, implements, and posts progress comments at milestones — not a
transcript.

The pull request references `AB#<id>` and transitions the linked work items when
it completes, so merging closes the tasks.

## `/azdo:archive`

Folds the delivered change into the specification.

Verifies every task is Done and the pull request merged, then applies each
requirement's delta to the spec store: `ADDED` is written in, `MODIFIED` replaces
what it supersedes, `REMOVED` is retired. Closes the requirements and the
Feature, and comments what changed in the spec.

**It refuses** to apply a `MODIFIED` or `REMOVED` requirement that does not name
what it supersedes, because a spec holding two contradictory versions of the same
behaviour is worse than no spec.
