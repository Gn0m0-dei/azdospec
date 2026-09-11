---
description: Implement an approved change — create its tasks, branch and pull request
argument-hint: "[work item id]"
disable-model-invocation: true
---

Follow the procedure in `${CLAUDE_PLUGIN_ROOT}/skills/azdospec/references/apply.md`,
using the conventions in `${CLAUDE_PLUGIN_ROOT}/skills/azdospec/references/work-items.md`.

Refuse to start unless the requirement has been approved and has an iteration,
and say which condition is missing.

Work item: $ARGUMENTS
