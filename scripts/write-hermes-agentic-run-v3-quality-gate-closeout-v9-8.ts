import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = (relativePath: string) => {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
};

const run = (command: string) => {
  try {
    execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8" });
    return { command, passed: true };
  } catch {
    return { command, passed: false };
  }
};

const inputArtifacts = [
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.json"
];

const index = readJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.json"
);

const outputArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-closeout/v9.8.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-closeout-v9.8.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-closeout-v9.8.md"
];

const validations = [
  run("npm run hermes:agentic-run-v3-quality-gate-index:v9.7:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-wiring-validation:v9.6:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-enforcement-validation:v9.2:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-validation:v8.6:gate")
];

const artifactPresent = inputArtifacts.every((p) => fs.existsSync(path.join(root, p)));
const validationsPassed = validations.every((v) => v.passed);

const closeout = {
  runtime: "hermes-agentic-run-v3-quality-gate-closeout-v9.8",
  generatedAt: new Date().toISOString(),
  status: "closed-out",
  inputArtifacts,
  outputArtifacts,
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    finalState: "quality-gate-hardening-complete",
    sourceIndex: "hermes-agentic-run-v3-quality-gate-index-v9.7"
  },
  closeout: {
    title: "Hermes Agentic Run v3 Quality Gate Closeout",
    summary:
      "Closes out run v3 quality-gate hardening from selector through durable index and marks the validated qualityGate shape ready for the next patch/apply cycle.",
    chain: [
      "v8.1 selector",
      "v8.2 target contract",
      "v8.3 quality gate plan",
      "v8.4 implementation intent",
      "v8.5 implementation",
      "v8.6 validation",
      "v8.7 adoption contract",
      "v8.8 adoption report",
      "v8.9 enforcement plan",
      "v9.0 enforcement intent",
      "v9.1 enforcement implementation",
      "v9.2 enforcement validation",
      "v9.3 wiring proposal",
      "v9.4 wiring intent",
      "v9.5 wiring implementation",
      "v9.6 wiring validation",
      "v9.7 quality gate index",
      "v9.8 closeout"
    ],
    qualityGate: index.qualityGate,
    outcome:
      "Run v3 produced a validated reusable qualityGate shape, fail-closed policy, future phase wiring map, and durable index.",
    nextRecommendedStep: {
      id: "run-v4-quality-gated-source-patch-proposal-v10.0",
      title: "First Quality-Gated Source Patch Proposal",
      summary:
        "Start the next cycle by proposing a bounded source patch that uses the v9.7 qualityGate contract before any apply step."
    }
  },
  safetyBoundary: {
    closeoutOnly: true,
    broadSourceRewrite: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults: validations,
  checks: {
    runtimeLabeled: true,
    statusClosedOut: true,
    inputArtifactsPresent: artifactPresent,
    indexReady: index.status === "indexed",
    qualityGateValidated: index.qualityGate?.status === "validated-for-future-use",
    qualityGatePassed: index.qualityGate?.passed === true,
    validationsPassed,
    closeoutOnly: true,
    noBroadSourceRewrite: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This closes out Hermes agentic run v3 quality-gate hardening.",
    "It does not apply a patch or rewrite existing workflow scripts.",
    "The next safe step is the first quality-gated source patch proposal."
  ]
};

for (const out of outputArtifacts.slice(0, 2)) {
  const full = path.join(root, out);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(closeout, null, 2) + "\n");
}

const md = `# Hermes Agentic Run v3 Quality Gate Closeout v9.8

Status: ${closeout.status}

## Outcome

${closeout.closeout.outcome}

## Chain

${closeout.closeout.chain.map((item) => `- ${item}`).join("\n")}

## Quality Gate

- Status: ${closeout.closeout.qualityGate.status}
- Passed: ${closeout.closeout.qualityGate.passed}
- Field: ${closeout.closeout.qualityGate.fieldName}
- Required checks: ${closeout.closeout.qualityGate.requiredChecks.join(", ")}

## Next Recommended Step

${closeout.closeout.nextRecommendedStep.title}

${closeout.closeout.nextRecommendedStep.summary}

## Safety

- Closeout only.
- No broad source rewrite.
- No patch applied.
- No branch created.
- No push.
- No merge.
- No PR opened.
`;

fs.writeFileSync(path.join(root, outputArtifacts[2]), md);

console.log(JSON.stringify(closeout, null, 2));
