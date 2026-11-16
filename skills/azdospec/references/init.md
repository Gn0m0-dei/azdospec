# Init — Set Up a Clone

Runs once per clone. Everything it resolves goes to the clone's local git
config, under the `azdospec.*` keys `SKILL.md` lists, which the other three
commands read. Nothing is written into the repository, so every teammate, and
every new clone, runs init once — and finds what an earlier run created instead
of creating it again.

---

## 0. Check the tooling

```bash
az account show --query user.name -o tsv
az extension show --name azure-devops --query version -o tsv
```

If the first fails, the user runs `az login`; if the second, `az extension add
--name azure-devops`. Say which and stop — nothing below works without both.

## 1. Look for an existing configuration

```bash
git config --local --get-regexp '^azdospec\.'
```

If it prints anything, this clone is already set up. Show the configuration and
ask whether to change it; stop unless the user says yes.

If the repository carries an `.azdospec.json` from an earlier version, migrate it
rather than asking everything again. Show what it holds and, once the user
confirms, write it as step 6 does:

| `.azdospec.json` | git config |
|---|---|
| `organization` | `azdospec.organization` |
| `project` | `azdospec.project` |
| `area_root` | `azdospec.area-root` |
| `spec_store` | `azdospec.spec-store` |
| `test_plan_id` | `azdospec.test-plan-id`, unless it is `null` |
| `repository` | Nothing — it comes from the remote |

Then offer to delete the file, and delete it only on a yes; removing it from the
repository is a change for the user to commit. When the organizations are split,
run the reach check of step 5; otherwise go straight to the report.

## 2. Resolve the destination

Read the repository's organization, project and name from the remote, as
`SKILL.md` describes, and propose the backlog in that same organization and
project.

Ask whether the backlog lives there. It may not: when the code sits in a client's
organization and the work items in another one, the organizations are split. Then
ask for the backlog's organization and list its projects to choose from:

```bash
az devops project list --org https://dev.azure.com/<organization> \
  --query "value[].name" -o tsv
```

If the remote is not an Azure DevOps URL, say so and ask for the organization and
project directly — the code can live anywhere, the work items cannot. That is a
split as well.

Show the destination and confirm it before writing anything. An organization
holds many projects, and a change created in the wrong one is tedious to undo.

## 3. Choose the area root

The Area Path under which this repository's capabilities live. Read the backlog
project's area paths and propose the one matching the repository name; confirm
with the user, and offer the project root when nothing matches.

```bash
az boards area project list --depth 2 --query "children[].path" -o tsv
```

Capabilities become children of this root. They are created on demand by
`propose`, never up front.

## 4. Detect the spec store

Look for the spec test plan first — another clone may already have created it:

```bash
az rest --resource 499b84ac-1321-427f-aa17-267ca6975798 \
  --url "$ORG/$PROJECT/_apis/testplan/plans?api-version=7.1" \
  --query "value[?name=='<repository> — specification'].id" -o tsv
```

If it exists, propose `testplans` with that plan. If not, try to create it, with
`az rest` as `work-items.md` sets it up:

```bash
printf '{"name": "%s"}' "<repository> — specification" > plan.json
az rest --resource 499b84ac-1321-427f-aa17-267ca6975798 --method post \
  --url "$ORG/$PROJECT/_apis/testplan/plans?api-version=7.1" --body @plan.json \
  --query '{id: id, root: rootSuite.id}' -o tsv
```

A `403` means Test Plans is not licensed for the signed-in user, which is common
and not a problem. Any other error is a real one: report it.

| Result | Default | Also offer |
|---|---|---|
| Test plan found or created | `testplans` | `wiki`, `epic`, `none` |
| Permission denied | `wiki` | `epic`, `none` |

State which one you detected and why, then let the user override it. Record
`test-plan-id` when the store is `testplans`.

The trade-offs belong in the conversation, not in a lecture: `testplans` makes
the spec executable, `wiki` reads best, `epic` works anywhere at the cost of a
backlog item that never closes, `none` keeps no merged spec at all.

## 5. Configure the branch policy

### Same organization

The `work-item-linking` policy refuses a pull request with no work item attached.
Without it the chain from requirement to merged code has a gap, and nothing else
in AzDOSpec can close it. Create it only when the branch does not have it yet:

```bash
az repos show --org $REPO_ORG --project $REPO_PROJECT --repository <repository> \
  --query id -o tsv
az repos policy list --org $REPO_ORG --project $REPO_PROJECT \
  --repository-id <repository-id> --branch main \
  --query "[?type.displayName=='Work item linking'].id" -o tsv
az repos policy work-item-linking create --org $REPO_ORG --project $REPO_PROJECT \
  --blocking true --enabled true \
  --branch main \
  --repository-id <repository-id>
```

If the user lacks permission, say so and point at the policy in project settings
rather than continuing silently. This step is optional in the sense that the
rest still works; it is the only part of the traceability chain that a human can
bypass.

### Split organizations

Skip the policy, and say why: it would live in the repository's organization,
where no work item from the backlog can satisfy it, so it would block every pull
request.

Check instead that the CLI reaches the repository:

```bash
az repos show --org $REPO_ORG --project $REPO_PROJECT --repository <repository> \
  --query id -o tsv
```

If it fails, the `az login` identity cannot reach the repository's organization —
the usual case for a guest there, where Microsoft supports only a personal
access token. Ask the user to run, in their own terminal:

```bash
az devops login --organization $REPO_ORG
```

with a token scoped to Code (Read & write), then check again. The Azure CLI keeps
that token for that organization alone, next to the `az login` that still serves
the backlog. Never ask for the token, receive it or echo it.

With a remote outside Azure DevOps there is no repository to check. Say that
`/azdo:apply` will push the branch and leave the pull request to the user.

## 6. Write the configuration

```bash
git config --local azdospec.organization contoso
git config --local azdospec.project Payments
git config --local azdospec.area-root 'Payments\API'
git config --local azdospec.spec-store wiki
```

Add `azdospec.test-plan-id` when the store is `testplans`. When reconfiguring
away from it, remove the key with `git config --local --unset
azdospec.test-plan-id`.

Nothing is committed. The configuration says where this clone's work items live
and nothing about any change; the change state lives in Azure DevOps, which is
the point of the tool.

## 7. Report

Say what was configured, which spec store is in use, whether the branch policy
was applied or why not, and that `/azdo:propose` is the next step.

Give the `git config` lines of step 6 for the team: pasting them into another
clone sets it up with the same area root and spec store. Running `/azdo:init`
there works too.

In split organizations, add what that means: nothing links the repository to the
backlog, so merging a pull request closes no task — they are moved to Done by
hand. Each teammate also needs the `az devops login` of step 5 if their sign-in
cannot reach the repository.
