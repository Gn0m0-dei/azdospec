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
- **Credential handling.** Authentication is your `az login`; this skill never asks for, stores or transmits a token. When the repository lives in an organization that sign-in cannot reach, you run `az devops login` there yourself, and the Azure CLI keeps that token. Anything here that leads an agent to request, echo or persist a credential is in scope.
- **Instructions that widen access.** `/azdo:init` configures a branch policy. Anything that weakens a policy, permission or approval requirement without the user asking is in scope.

Out of scope: vulnerabilities in Azure DevOps itself, in the Azure CLI, or in
your agent — report those to their maintainers.

## Running it safely

- Sign in with `az login` as an identity scoped to the projects you intend to use, not an organization-wide administrator.
- Review the draft before approving it. The approval gate is the control that makes the rest safe, and it only works if the draft is actually read.
- Check the destination when the agent states it. It lives in each clone's local git config, outside version control, so no review sees it change; the agent confirms the organization and project before the first write of every session.
- For a repository in another organization, scope the personal access token to Code (Read & write) and give it a short expiry.
