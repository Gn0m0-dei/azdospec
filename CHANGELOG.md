# Changelog

All notable changes to this skill are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Installed copies are updated with `npx skills update azdospec`.

## [Unreleased]

### Changed

- AzDOSpec reaches Azure DevOps through the Azure CLI — `az boards`, `az repos`, `az devops wiki`, and `az rest` for what the `azure-devops` extension has no command group for — instead of the Azure DevOps MCP server. One requirement on every host: the CLI with the extension, signed in with `az login`. The identity is that sign-in; there is still no token to create or store, and now there is no server to configure either.
- Every procedure names the command it runs and asks for the fields it needs with `--query`, so a step reads two values rather than a whole work item.
- `/azdo:init` checks that the CLI is installed and signed in before anything else, and reads Area Paths and creates the spec test plan through the CLI.
- `/azdo:apply` no longer creates the branch from the work item; the pull request, created with `az repos pr create --work-items … --transition-work-items true`, links the requirement and its tasks and closes them on completion.
- The `Related` link type is `System.LinkTypes.Related`; the reference used to spell it `System.LinkTypes.Related-Forward`, which does not exist.

### Removed

- The pi session check for `pi-mcp-adapter`, and the offer to install it: pi needs nothing beyond the package now.
- The opencode plugin's `AZDO_ORGANIZATION` variable and the MCP server it declared.
- The Claude Code plugin's organization prompt on install, and the `.mcp.json` it resolved into.

## [0.2.0] - 2026-09-15

### Changed

- A `MODIFIED` or `REMOVED` requirement now identifies what it supersedes by a `Related` link to the requirement that put the behaviour in the spec, and `/azdo:archive` resolves by that link before reading the prose. The prose stays required — it is what a reader sees during refinement, and it is what archive resolves by when there is no work item to link, as on a specification that predates azdospec. Where the two disagree, the link wins and archive reports the drift.

## [0.1.1] - 2026-09-11

### Fixed

- The readme shipped inside the package described opencode as not installable, which stopped being true the moment it was published.

## [0.1.0] - 2026-09-11

### Added

- The model: capabilities as Area Paths, a change as a Feature, requirements as backlog items of the project's Requirements category tagged `ADDED` / `MODIFIED` / `REMOVED`, tasks created only once the item reaches a sprint, and dependencies as `Predecessor / Successor` links.
- Four commands — `/azdo:init`, `/azdo:propose`, `/azdo:apply`, `/azdo:archive` — each with its procedure in `references/`, read on demand.
- The readiness gate: `/azdo:apply` refuses to start on a requirement that no product owner has approved or that has no iteration, and names the missing condition.
- The spec store abstraction (`testplans`, `wiki`, `epic`, `none`), detected by `/azdo:init`, so the living specification lands wherever the organization is licensed to keep it.
- `references/work-items.md`: work item type resolution per process, native field mapping, link type reference names, and the delta tag contract that `/azdo:archive` reads.
- Documentation for people in `docs/`, separate from the agent-facing procedures.
- Claude Code plugin packaging: `/azdo:init`, `/azdo:propose`, `/azdo:apply` and `/azdo:archive` exist as real commands rather than a documented convention, and installing the plugin configures the Azure DevOps MCP server — it asks for the organization name and connects to the remote server, so no token is created or stored.
- One set of command files in `commands/`, read by all three hosts, so a procedure is one edit rather than one per host.
- A pi extension that registers the four commands and, because pi ships no MCP of its own, checks for `pi-mcp-adapter` on every session and names the command that installs it instead of failing at the first write.
- An opencode plugin that registers the four commands, the skill directory and — when `AZDO_ORGANIZATION` is set — the Azure DevOps MCP server, so opencode needs one line of configuration rather than a copied directory. It never overwrites a command or server already configured.
- TypeScript, Biome, Vitest and husky for the host packaging, and nothing shipped inside `.claude/`, `.opencode/` or `.agents/`: those are where a machine keeps its own agent settings, so each host is pointed at a visible directory through its own manifest instead.
