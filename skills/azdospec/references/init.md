# Init — Set Up a Repository

Runs once per repository. Everything it resolves is written to `.azdospec.json`,
which the other three commands read.

---

## 0. Check the tooling

```bash
az account show --query user.name -o tsv
az extension show --name azure-devops --query version -o tsv
```

If the first fails, the user runs `az login`; if the second, `az extension add
--name azure-devops`. Say which and stop — nothing below works without both.

## 1. Resolve the destination

Derive organization, project and repository from the remote:

```bash
git remote get-url origin
```

Azure DevOps remotes look like
`https://dev.azure.com/<organization>/<project>/_git/<repository>` or
`https://<organization>@dev.azure.com/<organization>/<project>/_git/<repository>`.

Show what you derived and confirm it before writing anything. An organization
holds many projects, and a change created in the wrong one is tedious to undo.

If the remote is not an Azure DevOps URL, say so and ask for the organization and
project directly — the code can live anywhere, the work items cannot.

## 2. Choose the area root

The Area Path under which this repository's capabilities live. Read the project's
area paths and propose the one matching the repository name; confirm with the
user, and offer the project root when nothing matches.

```bash
az boards area project list --depth 2 --query "children[].path" -o tsv
```

Capabilities become children of this root. They are created on demand by
`propose`, never up front.

## 3. Detect the spec store

Try to create the spec test plan, with `az rest` as `work-items.md` sets it up:

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
| Test plan created | `testplans` | `wiki`, `epic`, `none` |
| Permission denied | `wiki` | `epic`, `none` |

State which one you detected and why, then let the user override it. Record
`test_plan_id` when the store is `testplans`.

The trade-offs belong in the conversation, not in a lecture: `testplans` makes
the spec executable, `wiki` reads best, `epic` works anywhere at the cost of a
backlog item that never closes, `none` keeps no merged spec at all.

## 4. Configure the branch policy

The `work-item-linking` policy refuses a pull request with no work item attached.
Without it the chain from requirement to merged code has a gap, and nothing else
in AzDOSpec can close it.

```bash
az repos show --repository <repository> --query id -o tsv
az repos policy work-item-linking create \
  --blocking true --enabled true \
  --branch main \
  --repository-id <repository-id>
```

If the user lacks permission, say so and point at the policy in project settings
rather than continuing silently. This step is optional in the sense that the
rest still works; it is the only part of the traceability chain that a human can
bypass.

## 5. Write the configuration

```json
{
  "organization": "contoso",
  "project": "Payments",
  "repository": "payments-api",
  "area_root": "Payments\\API",
  "spec_store": "wiki",
  "test_plan_id": null
}
```

Commit it. It is configuration, not state: it says where the work items live, and
nothing about any change. The change state lives in Azure DevOps, which is the
point of the tool.

## 6. Report

Say what was configured, which spec store is in use, whether the branch policy
was applied, and that `/azdo:propose` is the next step.
