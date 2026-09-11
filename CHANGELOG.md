# Changelog

All notable changes to this skill are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Installed copies are updated with `npx skills update azdospec`.

## [Unreleased]

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
