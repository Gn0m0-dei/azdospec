# Changelog

All notable changes to this skill are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Installed copies are updated with `npx skills update azdospec`.

## [Unreleased]

### Added

- The model: capabilities as Area Paths, a change as a Feature, requirements as backlog items tagged `ADDED` / `MODIFIED` / `REMOVED`, tasks created only once the item reaches a sprint, and dependencies as `Predecessor / Successor` links.
- Four commands — `/azdo:init`, `/azdo:propose`, `/azdo:apply`, `/azdo:archive` — and the readiness gate that keeps `apply` from starting on an item that is not Approved or has no iteration.
- The spec store abstraction (`testplans`, `wiki`, `epic`, `none`), so the living specification lands wherever the organization is actually licensed to keep it.
