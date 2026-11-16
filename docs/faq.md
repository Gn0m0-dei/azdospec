# FAQ

### Why not keep the specs in the repository, like OpenSpec?

Because the people who decide what gets built do not read the repository. Specs
in `openspec/` are perfect for the agent and invisible to the product owner, and
the link between a requirement and the work item that schedules it has to be
maintained by hand.

Remote-first inverts that: requirements live where the team already plans, and
the link to the branch, the pull request and the person is native.

The trade-off is real. You lose `git diff` on the spec, offline work, and the
ability to read everything with `ls`. If those matter more to you than
traceability, OpenSpec is the better tool and this one is not.

### Does this replace my backlog?

No. It writes to it, using the types your process already defines. Everything
AzDOSpec creates is an ordinary work item: your boards, queries, sprints,
dashboards and reports keep working, and anyone on the team can edit an item
without knowing this tool exists.

### Do I need Azure Test Plans?

No. It is the best spec store and the one `/azdo:init` prefers when it detects
the licence, but `wiki` works with plain Basic access and is the default
otherwise. See [spec stores](./spec-stores.md).

### Why the Azure CLI and not the Azure DevOps MCP server?

Three reasons, in order of weight.

Every host behaves the same. pi ships no MCP at all, by design, and opencode and
Claude Code each configure servers their own way; a CLI on the path is the same
on all of them, so there is one procedure and nothing per host to install,
declare or adapt.

The agent controls what comes back. `--query` returns the two fields a step
needs instead of a sixty-field work item, which is most of what a session spends
its context on. An MCP server returns what it decides to return.

Nothing is stored. `az login` is the identity, the same one you already use;
there is no PAT to create, paste or rotate, and `az rest` signs its calls with it
too. The one exception is a repository in an organization that sign-in cannot
reach — see below.

The cost is a dependency you install once: the Azure CLI and its `azure-devops`
extension. Test Plans has no command group, so those calls go through `az rest`
against the REST API — same identity, same shell.

### What happens if someone edits a work item by hand?

The work item is the source of truth, so the edit stands. AzDOSpec reads the
current state every time rather than caching it locally, which is the main
practical benefit of not keeping a copy in the repository.

### Why does `/azdo:apply` refuse to work on my change?

Because the requirement has not been approved by a product owner, or has no
iteration. That is the Definition of Ready, and the gate is deliberate: deciding
what is worth building is the one part of this workflow that should not be
automated.

### Can I use it without a sprint or an iteration?

Teams that do not run sprints can point the default iteration at the project root
and the gate reduces to "someone approved it". Kanban teams typically do exactly
that.

### Does it work on Azure DevOps Server?

The `azure-devops` extension supports on-premises collections when `--org` is
the collection URL. The model — Area Paths, Requirements category, hierarchy and
dependency links — exists in all supported versions. It has not been exercised
there; if you do, say so in an issue.

### Can the repository and the backlog live in different organizations?

Yes. It is the usual shape of consulting work: the code lives in the client's
organization, `<repo-org>`, and the backlog in yours, `<boards-org>`, which the
client cannot open. Tell `/azdo:init` that the backlog lives elsewhere and it
records `<boards-org>`. From then on the commands compare it with the
organization in the remote, on every run.

Links between work items and code — branches, commits, pull requests — exist
only inside one organization, so in that setup nothing is linked, and the
repository carries nothing that points at the backlog:

- The id is written `EXT-<id>`: branch `feature/EXT-<id>-<slug>`, commit footer
  `Refs: EXT-<id>`, pull request title `EXT-<id> <slug>`. Never `#<id>`: Azure
  Repos links every `#<id>` in a commit message — `AB#<id>` included — to the
  item with that id in `<repo-org>`, which is one of the client's own work items.
- No backlog URL, organization or project name, in commits or pull requests.
- No `work-item-linking` branch policy. It would live in `<repo-org>`, where no
  backlog item can satisfy it.
- Merging the pull request closes nothing. Move the tasks to Done by hand.
- `/azdo:archive` finds the merged pull request by its branch, and asks you when
  it cannot.

The Azure CLI has to reach both organizations. `az login` usually covers the
backlog. If you are a guest in `<repo-org>`, Microsoft supports only a personal
access token there: run `az devops login --organization
https://dev.azure.com/<repo-org>` yourself, with a token scoped to Code (Read &
write). The CLI keeps it for that organization alone, next to your `az login`.

Each clone keeps its own backlog organization, so different repositories can
point at backlogs in different organizations from the same machine.

### Can two people work on the same change at once?

Yes, and that is a reason the state is remote. Two agents, or an agent and a
person, see the same work items; progress comments are the handoff. Concurrent
implementation of the same requirement is split into streams by
`/azdo:apply`, one worktree each.

### Is my work item data sent anywhere?

No. There is no telemetry and no service: the skill is Markdown that instructs
your agent, and every call goes from your agent to your Azure DevOps
organization.
