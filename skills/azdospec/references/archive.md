# Archive — Merge the Change Into the Spec

The step that keeps the specification alive. Skip it and the backlog becomes a
changelog: a record of what was done, with nothing that states what is true now.

---

## 1. Verify the change is finished

Every task Done, and the pull request merged. If something is open, list it and
stop — archiving a change that is not delivered writes behaviour into the spec
that does not exist in the product.

```bash
az boards query --wiql "SELECT [System.Id], [System.State] FROM WorkItemLinks
  WHERE [Source].[System.Id] = <id>
    AND [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
  MODE (MustContain)" --query "[].[id, fields.\"System.State\"]" -o tsv
az repos pr list --repository <repository> --status completed \
  --query "[?contains(sourceRefName, 'AB<id>')].pullRequestId" -o tsv
```

## 2. Apply the deltas

For each requirement, read its delta tag and update the spec store accordingly.

| Tag | What to do |
|---|---|
| `ADDED` | Add the requirement and its scenarios to the capability's spec |
| `MODIFIED` | Replace what it supersedes, in place |
| `REMOVED` | Retire what it names |

Resolve what a `MODIFIED` or `REMOVED` supersedes by its link first, and by its
prose only when it carries no link. One that identifies neither cannot be
applied. Ask rather than guess: a spec that quietly accumulates two
contradictory versions of the same behaviour is worse than no spec.

The link names the requirement; with the `wiki` and `epic` stores it does not
name the passage. Use the prose to find the passage and the link to be sure it
is the right one. Where the prose no longer matches what the spec says, apply by
the link and report the drift.

### Per store

**`testplans`** — Move the test cases of `ADDED` and `MODIFIED` requirements from
`Design` to `Ready` with `az boards work-item update --id <case> --state Ready`;
edit the ones a `MODIFIED` supersedes rather than adding a second copy; close
the ones a `REMOVED` names. The suite for the Area Path is the spec.

**`wiki`** — Rewrite the page for the Area Path with the deltas applied. Read it
with its version, write the new content to a file, and update with that version,
which is how the wiki refuses to overwrite an edit made in between:

```bash
az devops wiki page show --wiki <wiki> --path "<area path>" --include-content \
  --query "[eTag, content]" -o tsv
az devops wiki page update --wiki <wiki> --path "<area path>" \
  --version <eTag> --file-path page.md --comment "AB#<id>"
```

The page states current behaviour, not history: no changelog section, no "as of
version X". The page's revision history already records how it got here.

**`epic`** — The same, in the description of the capability Epic, with
`az boards work-item update --id <epic> --description "<html>"`.

**`none`** — Nothing to merge. The Done requirements are the record.

## 3. Close the change

Move the requirements and the Feature to Done with
`az boards work-item update --id <id> --state Done`. Leave `REMOVED`
requirements Done as well — they were delivered; what they described is what no
longer exists.

Use `Removed`, not `Done`, only for work that was abandoned without being built.

## 4. Report

Post a closing comment on the Feature, with `--discussion`, stating what changed
in the spec — which requirements were added, which behaviour was replaced, which
was retired — and link the spec store page, suite or Epic.

Then tell the user the same, with the URL.
