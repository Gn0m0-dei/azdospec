# Security Policy

## Reporting a vulnerability

Report privately through
[GitHub Security Advisories](https://github.com/Gn0m0-dei/azdospec/security/advisories/new).
Please do not open a public issue for a vulnerability.

## Scope

This project ships Markdown instructions for an AI agent. It contains no
executable code, has no service behind it, and collects no telemetry.

What it does do is instruct an agent to write to your Azure DevOps organization.
The relevant risks live there:

- **Instructions that cause unintended writes.** A flaw that makes the agent create, modify or close work items without approval is in scope, and is treated as a vulnerability rather than a bug.
- **Credential handling.** Authentication belongs to the Azure DevOps MCP server; this skill never asks for, stores or transmits a token. Anything here that leads an agent to request, echo or persist a credential is in scope.
- **Instructions that widen access.** `/azdo:init` configures a branch policy. Anything that weakens a policy, permission or approval requirement without the user asking is in scope.

Out of scope: vulnerabilities in Azure DevOps itself, in the MCP server, or in
your agent — report those to their maintainers.

## Running it safely

- Connect the integration as an identity scoped to the projects you intend to use, not an organization-wide administrator.
- Review the draft before approving it. The approval gate is the control that makes the rest safe, and it only works if the draft is actually read.
- Keep `.azdospec.json` in version control. It records the destination, so an unexpected change to it is visible in review.
