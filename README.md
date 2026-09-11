# AzDOSpec

> **Your backlog is the spec.**
>
> Remote-first spec-driven development for Azure DevOps — proposals, requirements
> and tasks as work items, linked to branches, PRs and people.

> **Status: design phase.** The model below is settled; the command procedures
> are being written. Not usable yet.

An agent skill that runs spec-driven development entirely inside Azure DevOps.
[OpenSpec](https://github.com/Fission-AI/OpenSpec) keeps proposals, specs and
tasks as Markdown in an `openspec/` folder inside the repository. AzDOSpec keeps
the same model and drops the folder: every artifact is a native Azure Boards
work item, every relationship is a native link, and the agent reads the current
state with WIQL instead of `ls`.

The result is one source of truth the whole team already looks at, where a
requirement is connected to the branch that implements it, the pull request that
merges it, the tests that verify it and the person who owns it.

Built on the open [Agent Skills](https://www.skills.sh) standard (a `SKILL.md`
with `name`/`description` frontmatter plus instructions), so it works with any
compatible agent — Claude Code, opencode, pi, and others.

## How it maps

| OpenSpec | Azure DevOps |
|---|---|
| Capability | Area Path |
| `proposal.md` | Feature — a single backlog item when the change has one requirement, an Epic when it spans Features |
| Requirement + scenarios | Backlog item (User Story / Product Backlog Item / Requirement / Issue, depending on the process) with Gherkin acceptance criteria and an `ADDED` / `MODIFIED` / `REMOVED` tag |
| `design.md` | Description of the Feature, or a linked page for long-form design |
| `tasks.md` | Checklist in the description while proposed; child Tasks once the item is committed to a sprint |
| Dependencies | `Predecessor / Successor` and `Related` links |
| Merged spec (`specs/`) | Spec store, see below |
| Archive | Deltas applied to the spec store, items moved to Done |

Capabilities are Area Paths rather than long-lived work items on purpose: a
backlog is a list of work, and an item that never closes distorts every board,
rollup and velocity chart it appears on.

Traceability is native throughout — parent/child hierarchy, `AB#<id>` in commits
and pull requests, branch links, pull request completion transitioning the linked
work items, and a branch policy that refuses a pull request with no work item
attached.

## Commands

| Command | What it does |
|---|---|
| `/azdo:init` | One shot per repository. Resolves organization and project from the git remote, detects which spec store is available, configures the branch policy and writes `.azdospec.json`. |
| `/azdo:propose <idea>` | Reads the current spec, drafts the whole change — Feature, one requirement per delta, task checklist — shows it as a single draft, and creates and links everything once approved. |
| `/azdo:apply` | Refuses unless the requirement is at least Approved and has an iteration. Creates the Tasks, derives parallel streams from the dependency links, creates the branch from the work item and posts progress comments while implementing. |
| `/azdo:archive` | Verifies the Tasks are Done, applies the deltas to the spec store and closes the change with a summary. |

## Spec store

Where the merged, living specification of each capability lives. Chosen once by
`/azdo:init`, driven by what the organization actually licenses:

| Store | Requires | What it does |
|---|---|---|
| `testplans` | Basic + Test Plans | Each scenario becomes a Test Case — `Design` while proposed, `Ready` once archived, `Closed` when removed — grouped in a suite per Area Path and linked `Tests / Tested By` to its requirement. Specification by example: the spec is executable. |
| `wiki` | Basic | Default when Test Plans is not licensed. One page per Area Path, rewritten on archive. |
| `epic` | Basic | Opt-in. One long-lived Epic per Area Path holding the spec in its description. Works everywhere, at the cost of a backlog item that never closes. |
| `none` | — | Opt-in. No merged spec; the agent reads the Done items of the Area Path. |

## Requirements

- An agent that supports [Agent Skills](https://www.skills.sh) — Claude Code,
  opencode, pi, and others.
- The official [Azure DevOps MCP Server](https://learn.microsoft.com/azure/devops/mcp-server/mcp-server-overview)
  (`@azure-devops/mcp`) connected to that agent. Everything AzDOSpec does is a
  write to Azure DevOps, so there is no offline mode.
- The [`azure-devops-create-work-item`](https://github.com/Gn0m0-dei/azure-devops-create-work-item)
  skill, installed alongside this one. AzDOSpec decides *what* work items a change
  needs; that skill decides *how* each one is written — which type the project
  actually exposes, which sections it carries, and the rule that nothing reaches
  Azure DevOps before you approve it. AzDOSpec does not restate those rules, and
  says so instead of guessing when the skill is missing.

## Install

Both skills, with the `skills` CLI (agent-agnostic):

```bash
npx skills add Gn0m0-dei/azdospec
npx skills add Gn0m0-dei/azure-devops-create-work-item
```

Or copy the skill folder (`skills/azdospec/`, the one containing `SKILL.md`)
into the skills directory your agent reads:

**Claude Code**
- Global: `~/.claude/skills/azdospec/`
- Project: `<repo>/.claude/skills/azdospec/`

**opencode**
- Global: `~/.config/opencode/skills/azdospec/`
- Project: `<repo>/.opencode/skills/azdospec/`
- Also reads `.claude/skills/` and `.agents/skills/`, so a Claude Code install
  is picked up too.

**pi**
- Global: `~/.pi/agent/skills/azdospec/`
- Project: `<repo>/.agents/skills/azdospec/` (or `<repo>/.pi/skills/…`)

Any other Agent-Skills–compatible agent: drop the folder into its configured
skills directory (most also read `.agents/skills/`).

## Usage

Run `/azdo:init` once per repository, then work through
`/azdo:propose`, `/azdo:apply` and `/azdo:archive`. However your agent spells
slash commands, invoking the skill by name and stating the phase works too.

## Layout

```
skills/azdospec/
├── SKILL.md          # model, commands, hard rules
└── references/       # the procedure per command, read on demand
```

`SKILL.md` is loaded whenever the skill activates; the `references/` files are
read on demand, so only the detail a request actually needs enters the context.

## Credits

The artifact model comes from [OpenSpec](https://github.com/Fission-AI/OpenSpec);
the execution discipline — progress comments, dependency-driven parallel work,
one branch per change — from [CCPM](https://github.com/automazeio/ccpm). Both are
local-first. AzDOSpec is the remote-first take on the same idea.

## License

MIT — see [LICENSE](./LICENSE).
