# Hermes Agentic Run v4 Quality-Gated PR Lifecycle Plan v10.5

- Runtime: hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5
- Status: planned
- Generated: 2026-06-06T21:39:43.892Z
- Run: hermes-agentic-run-v4
- Source PR draft: hermes-agentic-run-v4-quality-gated-pr-draft-v10.4

## Lifecycle Plan

- Branch: `hermes/agentic-run-v4-quality-gated-source-patch-v10-3`
- Base: `main`
- Mode: operator-controlled-plan

## Operator Commands

- `git switch -c hermes/agentic-run-v4-quality-gated-source-patch-v10-3`
- `npm run hermes:agentic-run-v4-quality-gated-pr-draft:v10.4:check`
- `npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:check`
- `npm run check`
- `npm run mastra:check`
- `git status --short --branch`
- `git push -u origin hermes/agentic-run-v4-quality-gated-source-patch-v10-3`
- `gh pr create --base main --head hermes/agentic-run-v4-quality-gated-source-patch-v10-3 --title "Add Hermes agentic run v4 quality-gated source patch" --body-file reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.md`

## Required Gates

- `npm run hermes:agentic-run-v4-quality-gated-pr-draft:v10.4:gate`
- `npm run hermes:agentic-run-v4-quality-gated-branch-prepare:v10.3:gate`
- `npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate`
- `npm run check`
- `npm run mastra:check`

## Fail-Closed Conditions

- Do not create a branch if qualityGate is missing, failed, null, or incomplete.
- Do not push if generated artifact drift is undeclared.
- Do not open a PR if required apply fields are missing.
- Do not open a PR if changed paths are outside declared targets.
- Do not merge from this lifecycle plan.
- Keep branch creation, push, PR creation, and merge operator-controlled.

## Safety Boundary

- Plan only: true
- Branch created: false
- Pushed: false
- PR opened: false
- Merged: false

## Checks

- runtimeLabeled: true
- statusPlanned: true
- prDraftReady: true
- qualityGatePresent: true
- qualityGatePassed: true
- operatorCommandsDeclared: true
- requiredGatesDeclared: true
- failClosedConditionsDeclared: true
- planOnly: true
- noBranchCreated: true
- noPush: true
- noMerge: true
- noPrOpened: true
