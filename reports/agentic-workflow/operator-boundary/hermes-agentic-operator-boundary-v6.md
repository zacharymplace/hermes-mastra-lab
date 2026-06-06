# Hermes Agentic Operator Boundary v6

Generated: 2026-06-06T06:00:34.279Z
Status: documented

## Source event

Hermes Agentic Branch Prepare v5 created a local branch inside the workflow, then the outer operator terminal command pushed that branch and opened a draft PR.

## Workflow actions

- selected project context
- generated execution plan
- generated patch candidate
- applied constrained local patch
- ran validation
- drafted PR metadata
- created or switched local branch after approval

## Operator actions

- pushed local branch to origin
- opened GitHub draft pull request

## Correct semantics

- Workflow pushed: false
- Operator pushed: true
- Workflow opened PR: false
- Operator opened PR: true

## Linked artifacts

- Branch: `hermes/agentic-pr-draft-v4`
- PR: #1
- URL: https://github.com/zacharymplace/hermes-mastra-lab/pull/1

## Notes

- This artifact corrects the v5 reporting ambiguity.
- Hermes workflow reports must distinguish workflow actions from operator actions.
- The workflow did not push or open a PR; the outer terminal commands did.
