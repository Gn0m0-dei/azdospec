# Contributing

Thanks for considering it. This project is Markdown that instructs an agent, so
contributing is mostly writing and testing prose — there is no build step and
nothing to compile.

## Before you open a pull request

Open an issue first for anything that changes behaviour: a new command, a change
to the model, a new spec store. The mapping to Azure DevOps is deliberate and
mostly settled, and a discussion is cheaper than a rewritten pull request. See
[how it maps](./docs/how-it-maps.md) for the reasoning behind the choices that
look arbitrary.

Typos, clarifications and documentation fixes need no issue.

## What to keep in mind

**The skill is read by an agent, under a context budget.** `SKILL.md` is loaded
every time the skill activates; `references/` files are read only when their
command runs. Put procedure in `references/`, not in `SKILL.md`, and keep both
terse. Prose that reads well and instructs badly is a regression.

**`docs/` is for people, `references/` is for the agent.** The same content in
both places will drift. Link instead of duplicating.

**Nothing reaches Azure DevOps without approval.** Any change that weakens the
approval gate, the readiness gate, or the rule against inventing requirements
needs to argue for itself in the issue first.

**Prefer native Azure DevOps behaviour.** If Boards already does it — link types,
policies, rollups, transitions — use it rather than reimplementing it.

## Testing a change

There is no test suite. Test against a real Azure DevOps project you are allowed
to write to, and say in the pull request which process it uses (Agile, Scrum,
CMMI or Basic) and which spec store you exercised. Behaviour differs per process,
and a change verified only on Scrum may break Basic, which has no Feature level.

## Style

- English, everywhere: content, commit messages, pull requests, documentation.
- [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
- Add a `## [Unreleased]` entry to `CHANGELOG.md` for anything that changes behaviour.
