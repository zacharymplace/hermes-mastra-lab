# Mastra API Exploration

Purpose:
Document the real Mastra API surface before wiring framework code into Hermes.

## Current finding

Mastra is most relevant to Hermes as a workflow and agent orchestration runtime, not as the owner of Hermes domain logic.

## API areas to inspect first

### 1. Workflows

Mastra workflows are designed around structured steps, branching, parallel execution, suspension, and controlled execution flow.

Hermes mapping:

Sentra input
→ generate ideas
→ critique
→ score
→ recommend
→ emit artifacts

Likely Mastra concepts:
- `createWorkflow`
- `createStep`
- `.then()`
- `.foreach()`
- `.commit()`

Promotion question:
Does Mastra make this clearer than the current TypeScript workflow?

### 2. Agents inside workflow steps

Mastra supports calling agents from workflow steps using agent execution methods such as `.generate()` or `.stream()`.

Hermes mapping:

- generator agent
- critic agent
- scorer/evaluator
- recommendation synthesizer

Promotion question:
Can Hermes keep typed boundaries while delegating reasoning steps to Mastra agents?

### 3. Tools

Mastra tools appear useful for deterministic Hermes functions:
- scoring
- validation
- artifact writing
- promotion gates
- context loading

Promotion question:
Do tools make deterministic operations easier to compose and trace?

### 4. Control flow

Useful Mastra workflow patterns to test:
- branching
- parallel critique
- foreach candidate scoring
- retries
- early bail
- suspend/resume

Hermes mapping:
- reject weak ideas early
- score multiple candidates
- pause for human review
- resume after approval

### 5. Human-in-the-loop

Mastra's suspend/resume and HITL model may map well to Hermes promotion gates.

Hermes mapping:
- agent proposes
- gate pauses
- human approves/rejects
- workflow resumes or bails

Promotion question:
Can this replace ad hoc review gates without hiding state?

### 6. Processors / guardrails

Mastra processors may be useful for:
- input normalization
- output validation
- prompt-injection checks
- PII redaction
- response shaping

Promotion question:
Are processors useful enough to justify framework adoption, or should Hermes keep these as plain TypeScript checks?

## Do not wire yet

Do not import Mastra runtime code until this repo has a clear target implementation plan.

## First implementation target

Build one Mastra-native version of the current deterministic flow:

Input schema
→ generate step
→ critique step
→ score foreach
→ recommend step
→ write JSON artifact

The Mastra version must produce an artifact comparable to:

- `hermes/idea-recommendation.json`
- `hermes/mastra-adapter-spike.json`

## Promotion criteria

Mastra can advance only if the native workflow improves at least two of:

- clarity
- type safety
- observability handoff
- human review flow
- retry/error handling
- workflow composition

Mastra should be rejected or contained if it causes:

- hidden state
- fragile imports
- unclear execution traces
- harder local testing
- domain logic migration into framework code
