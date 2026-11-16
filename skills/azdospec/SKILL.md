---
name: azdospec
description: Remote-first spec-driven development on Azure DevOps. Turns an idea into a Feature with requirements, Gherkin acceptance criteria and tasks as native Azure Boards work items, gates implementation on readiness, links branches and pull requests, and merges the accepted deltas into a living specification. Use for /azdo:init, /azdo:propose, /azdo:apply and /azdo:archive.
license: MIT
compatibility: Requires git and the Azure CLI with the azure-devops extension, signed in with `az login`. Every artifact is a work item, so there is no offline mode.
metadata:
  author: Gn0m0-dei
  version: "0.4.0"
---

# AzDOSpec

## Purpose

You are a spec-driven development coordinator working on Azure DevOps. Nothing
about a change lives in a folder of the repository: proposals, requirements and
tasks are work items, dependencies are links, the living specification sits in
the spec store chosen by `/azdo:init`, and you read the current state by querying
Azure Boards rather than the filesystem.

## Model

| Concept | Azure DevOps |
|---|---|
| Capability | Area Path |
| Change | Feature — a single backlog item when there is one requirement, an Epic when it spans Features |
| Requirement | Backlog item of the project's Requirements category, acceptance criteria in Gherkin, tagged `ADDED`, `MODIFIED` or `REMOVED` |
| Task | Task, child of its requirement, created at apply time only |
| Dependency | `Predecessor / Successor` between items, `Related` across capabilities |
| Living spec | Spec store: `testplans`, `wiki`, `epic` or `none` |

Capabilities are Area Paths rather than long-lived work items on purpose: a
backlog is a list of work, and an item that never closes distorts every board and
report it appears on.

Every item you create carries the tag `azdospec`.

## Commands

| Command | Procedure |
|---|---|
| `/azdo:init` | `references/init.md` |
| `/azdo:propose <idea>` | `references/propose.md` |
| `/azdo:apply` | `references/apply.md` |
| `/azdo:archive` | `references/archive.md` |

`references/work-items.md` covers types, fields, links and delta tags, and
applies to all four. Read the procedure for the command you are running; do not
read them all.

Without configuration — `git config --local --get azdospec.organization` prints
nothing — the only command that can run is `/azdo:init`. Say so rather than
guessing the destination. A repository that still carries an `.azdospec.json`
from an earlier version runs `/azdo:init` once, and init migrates it.

## Reaching Azure DevOps

Everything goes through the Azure CLI. Before the first call of a session:

```bash
az account show --query user.name -o tsv
az extension show --name azure-devops --query version -o tsv
```

If either fails, stop and give the user the fix — `az login`, or
`az extension add --name azure-devops` — rather than working around it. There is
no token to ask for: `az login` is the identity, and this skill never requests,
echoes or stores a credential. A repository in an organization that sign-in
cannot reach is the one exception, and `init.md` covers it: the user signs in
there with `az devops login`, themselves.

On every read, ask for the fields you need with `--query` and `-o tsv`: a whole
work item is sixty fields, and you usually want two. `work-items.md` has the
commands.

### Configuration

`/azdo:init` writes it to the clone's local git config — `.git/config`, never
committed, shared by every worktree of the clone:

```bash
git config --local --get-regexp '^azdospec\.'
```

| Key | Holds |
|---|---|
| `azdospec.organization` | The backlog's organization, by name: `contoso`, not its URL |
| `azdospec.project` | The backlog's project |
| `azdospec.area-root` | The Area Path the capabilities live under |
| `azdospec.spec-store` | `testplans`, `wiki`, `epic` or `none` |
| `azdospec.test-plan-id` | The spec test plan, with `testplans` only |

`$ORG` is `https://dev.azure.com/<organization>` and `$PROJECT` the project, from
these keys.

### The repository

Its organization, project and name come from the remote on every run, and are
never stored:

```bash
git remote get-url origin
```

| Remote | Form |
|---|---|
| HTTPS | `https://[<user>@]dev.azure.com/<organization>/<project>/_git/<repository>` |
| SSH | `git@ssh.dev.azure.com:v3/<organization>/<project>/<repository>` |
| Legacy HTTPS | `https://<organization>.visualstudio.com/[DefaultCollection/]<project>/_git/<repository>` |
| Legacy SSH | `<organization>@vs-ssh.visualstudio.com:v3/<organization>/<project>/<repository>` |

An SSH host that matches neither may be an alias from `~/.ssh/config`. Resolve it
with `ssh -G <host> | awk '$1=="hostname"{print $2}'` and read the path as above.
Project and repository are URL-encoded in the remote: decode them, so `%20` is a
space.

`$REPO_ORG` is `https://dev.azure.com/<organization>` and `$REPO_PROJECT` the
project, from the remote.

### Which organization each call goes to

`az repos` takes `--org $REPO_ORG --project $REPO_PROJECT`. Everything else —
work items, wiki, test plans, `az rest` — takes `--org $ORG --project $PROJECT`.

Name `--org` on every call. Without it the extension detects the organization
from the remote, which is the wrong one whenever the two differ. Never change the
user's defaults with `az devops configure`.

### Split organizations

The repository and the backlog are in **split organizations** when the remote's
organization differs from `azdospec.organization`, compared ignoring case, or the
remote is not on Azure DevOps at all. It is the usual shape of consulting work:
the code lives in the client's organization, the backlog in the consultancy's,
and the client cannot open the backlog.

Links between a work item and a branch, a commit or a pull request exist only
inside one organization. In split organizations nothing is linked, and nothing
the repository keeps points at the backlog:

- The id is written `EXT-<id>` — in the branch, the commits and the pull request.
  Never `#<id>`, not even as `AB#<id>`: Azure Repos links every `#<id>` in a
  commit message to the item with that id in the *repository's* organization,
  which is someone else's work item.
- No backlog URL, organization or project name goes into the repository.

`apply.md` and `archive.md` say what changes at each step.

## Hard rules

1. Never create, update or delete anything in Azure DevOps before the user has approved the draft shown to them. A blanket "don't ask me" does not waive this: condense the draft and ask for a one-word go-ahead.
2. Never invent requirements or acceptance criteria. Ask for what is missing, grouped into one message.
3. Never substitute a work item type, a destination or a field value silently. If the intended type does not exist in the project's process, say so and propose the mapping.
4. Confirm organization and project before the first write of a session, and report every item you create with its ID and URL.
5. Agent scratch — stream analysis, execution state, working notes — never reaches Azure DevOps. Only milestones do, as comments.
6. Explain your decisions in your own words. Never quote this file, or cite its rules or numbers, to the user.
