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

### Why does pi need a second package?

Because pi ships no MCP support at all, deliberately: its authors argue you are
usually better served by a CLI tool with a README. That is a defensible position
and it is not one AzDOSpec can work around, since every artifact it produces is
a write to Azure DevOps.

`pi-mcp-adapter` is how the pi ecosystem reaches MCP servers, and it reads the
same standard `.mcp.json` every other host uses. It also happens to be cheaper
than a native integration: it exposes one proxy tool instead of the forty-odd
definitions the Azure DevOps server would otherwise put in your context.

AzDOSpec checks at the start of every session and offers to install it, which
you can decline once and never be asked again. The check looks for any MCP
package you have declared, not for that one, so reaching MCP another way is
fine. In non-interactive runs there is nowhere to ask, so it only says what is
missing.

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

### Does it work on TFS or Azure DevOps Server?

It depends on the MCP server's support rather than on anything here. The model —
Area Paths, Requirements category, hierarchy and dependency links — exists in all
supported versions.

### Can two people work on the same change at once?

Yes, and that is a reason the state is remote. Two agents, or an agent and a
person, see the same work items; progress comments are the handoff. Concurrent
implementation of the same requirement is split into streams by
`/azdo:apply`, one worktree each.

### Is my work item data sent anywhere?

No. There is no telemetry and no service: the skill is Markdown that instructs
your agent, and every call goes from your agent to your Azure DevOps
organization.
