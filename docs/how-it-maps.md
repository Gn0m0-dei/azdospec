# How It Maps

AzDOSpec keeps [OpenSpec](https://github.com/Fission-AI/OpenSpec)'s model and
drops its folder. This page explains the choices that are not obvious.

---

## The mapping

| OpenSpec | Azure DevOps |
|---|---|
| Capability | Area Path |
| `proposal.md` | Feature |
| Requirement + scenarios | Backlog item with Gherkin acceptance criteria and a delta tag |
| `design.md` | Description of the Feature |
| `tasks.md` | Checklist while proposed; child Tasks once in a sprint |
| Dependencies | `Predecessor / Successor`, `Related` |
| `specs/` | Spec store |

## Why capabilities are Area Paths

The obvious move is a long-lived Epic per capability, holding the spec. It works,
and it is wrong.

A backlog is a list of work, and every item on it is created to be closed. An item
that never closes distorts the portfolio board, the cumulative flow, the rollups
and the forecast, permanently. Teams that try it end up with "bucket epics" that
everyone learns to filter out.

Area Paths are the native taxonomy for exactly this: permanent, hierarchical
(`Auth/Login`, `Auth/MFA`), carried by every work item type including Test Cases,
free, and queryable. Nothing has to be invented.

`epic` remains available as a spec store for teams who want the spec text inside
Boards and accept the cost.

## Why tasks arrive late

A proposal lists the work it expects. Creating those as Tasks immediately fills
the sprint backlog with items nobody has planned, estimated or committed to.

So the checklist stays in the requirement's description until the item reaches a
sprint, and `/azdo:apply` creates the Tasks then — which is when a team would
create them anyway, at planning.

## Why apply has a gate

`/azdo:apply` refuses to start unless a product owner has approved the requirement
and it has an iteration.

This is the Definition of Ready, enforced. Without it the agent will happily build
whatever it was pointed at, and the backlog stops describing what the team agreed
to do. The gate is also the point where a human is required — proposing and
building are both automatable; deciding what is worth building is not.

## Why the spec is not the Done items

Closed requirements are a changelog. They record that something was agreed at a
point in time — including the ones that a later change modified or removed, which
stay closed with their now-false acceptance criteria attached.

A specification states what is true now. Getting from one to the other requires
merging deltas, which is what `/azdo:archive` does and where the spec store comes
in.

## What is native, not built

Everything below is Azure DevOps doing the work. AzDOSpec only arranges it:

- Parent/child hierarchy between Epic, Feature, requirement and Task.
- `AB#<id>` in a commit or pull request, linking code to the item.
- Branch links created from a work item.
- Pull request completion transitioning linked work items.
- The `work-item-linking` branch policy refusing an unlinked pull request.
- `Tests / Tested By` between a test case and its requirement.
- Comment threads with `@mentions` for handoff between people and agents.
