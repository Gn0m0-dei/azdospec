# Getting Started

## Before you begin

You need three things:

1. An agent that supports [Agent Skills](https://www.skills.sh) or Claude Code plugins — Claude Code, opencode, pi, and others.
2. A connection to the [Azure DevOps MCP Server](https://learn.microsoft.com/azure/devops/mcp-server/mcp-server-overview), as an identity that can create work items in your project.
3. A repository whose remote is an Azure DevOps repository.

Everything AzDOSpec produces is a work item, so there is no offline or draft-only
mode. If the integration is missing, the skill says so and stops.

## Install

On Claude Code, install it as a plugin and the second requirement is handled for
you:

```
/plugin marketplace add Gn0m0-dei/azdospec
/plugin install azdo
```

You are asked for your Azure DevOps organization name on install — the
organization alone, not the URL. The plugin connects to the remote MCP server
using your existing Azure identity, so there is no token to create, paste or
rotate.

On pi, the package installs the same four commands, and a second install gives
pi the MCP connection it does not ship with:

```bash
pi install git:github.com/Gn0m0-dei/azdospec
pi install npm:pi-mcp-adapter
```

On any other Agent Skills host, install the skill and configure the MCP server
yourself. There are no commands then — describe what you want and the skill
activates by itself:

```bash
npx skills add Gn0m0-dei/azdospec
```

The [README](../README.md#install) has the detail per host, including what
opencode still needs.

This guide writes the commands as Claude Code spells them, `/azdo:init`. On pi
and opencode there is no plugin namespace, so the same command is `/azdo-init`.

## Set up the repository

```
/azdo:init
```

This runs once. It derives your organization and project from the git remote and
asks you to confirm them, proposes the Area Path your capabilities will live
under, detects which spec store your organization can use, configures the branch
policy that requires a work item on every pull request, and writes
`.azdospec.json`.

Commit that file. It records where the work items live — nothing about any
individual change, which is what makes the approach remote-first.

## Your first change

```
/azdo:propose add rate limiting to the public API
```

The agent reads what the spec already says about the capability, asks about
anything it cannot infer — and it will ask rather than guess — then shows you the
whole change as one draft: the Feature, one requirement per behaviour with its
acceptance criteria in Gherkin, and the task checklist.

Nothing exists in Azure DevOps until you approve that draft.

Once you do, you get real work items with real IDs, in `New`.

## Getting it built

A proposed change is not a ready change. Before `/azdo:apply` will touch it, a
product owner has to approve the requirement and put it in a sprint — exactly
what they would do for any other backlog item.

```
/azdo:apply
```

The agent refuses if the item is not ready and tells you which condition is
missing. Otherwise it creates the tasks, works out what can run in parallel,
creates the branch from the work item, implements, posts progress as comments,
and opens a pull request that closes the tasks when it merges.

## Closing the loop

```
/azdo:archive
```

This is the step people skip, and the one that matters most. It takes the
delivered requirements and folds them into the specification: added behaviour is
written in, changed behaviour replaces what it supersedes, removed behaviour is
retired.

Without it you have a changelog — a record of work done. With it you have a
specification: a statement of what is true now.

## Next

- [Commands](./commands.md) — what each one does, and what it refuses to do
- [How it maps](./how-it-maps.md) — why capabilities are Area Paths
- [Spec stores](./spec-stores.md) — choosing where the living spec lives
