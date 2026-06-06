# Hermes Agentic Workflow v1

Hermes should become the execution arm for Sentra-selected work.

Sentra decides what matters.

Hermes turns the selected work into bounded execution.

## Target loop

```text
Sentra selected project
  ↓
Hermes execution plan
  ↓
patch proposal
  ↓
tests/checks
  ↓
execution report
  ↓
human approval
  ↓
merge or hold
```

## Non-negotiable gates

- No merge without human approval.
- No execution without a written plan.
- No plan without a selected Sentra project.
- No completed task without test output or an explicit reason tests are unavailable.
- No domain logic hidden inside framework code.

## First safe scope

The first implementation should support repo-local work only:

- read Sentra-selected project
- generate an execution plan
- propose file changes
- run checks
- write an execution report
- stop before merge

## Success criteria

- Hermes can convert Sentra's selected project into a concrete execution plan.
- Hermes can produce a patch/report artifact.
- Hermes can run validation commands.
- Hermes can classify the result as pass, blocked, or needs review.
- Human approval remains required before merge.

## Source Patch Proposal v1

Hermes may propose source-code changes, but proposal is not application.

The source patch proposal step must:

- declare target files
- describe proposed modifications
- define validation commands
- include rollback notes
- require human approval before apply
- avoid auto-merge
- avoid push

This creates a safe bridge from artifact-only execution toward source-code execution.

## Source Patch Apply v1

Hermes may apply narrowly constrained source patches only after explicit approval.

The source patch apply step must:

- read a source patch proposal artifact
- verify all target files are inside approved prefixes
- verify approval was granted
- write an apply report
- avoid push
- avoid auto-merge
- preserve rollback notes

This is the first controlled bridge from source patch proposal to source patch application.
