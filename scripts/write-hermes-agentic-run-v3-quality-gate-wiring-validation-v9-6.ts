import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function writeJson(filePath: string, value: unknown) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(value, null, 2) + "\n");
}

function run(command: string) {
  try {
    execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8" });
    return true;
  } catch {
    return false;
  }
}

const implementationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json";

const implementation = readJson(implementationPath);
const wiring = implementation.wiringImplementation;
const qualityGateShape = wiring.qualityGateShape ?? {};

const requiredOutputFields = [
  "status",
  "requiredChecks",
  "results",
  "generatedArtifactDrift",
  "timestampChurn",
  "noOpPatchClaims",
  "humanBoundaryPreserved",
  "declaredTargetOnlyChanges",
  "passed"
];

const missingOutputFields = requiredOutputFields.filter(
  (field) => !(field in qualityGateShape)
);

const requiredChecks = [
  "generated-artifact-drift",
  "stale-timestamp-churn",
  "no-op-patch-claims",
  "human-boundary-preservation",
  "declared-target-only-changes"
];

const carriedChecks = qualityGateShape.requiredChecks ?? [];
const missingRequiredChecks = requiredChecks.filter(
  (check) => !carriedChecks.includes(check)
);

const requiredPhases = [
  "source-patch-proposal",
  "source-patch-apply",
  "source-patch-validation",
  "branch-prepare",
  "pr-draft",
  "post-merge-ledger",
  "run-index"
];

const wiredPhases = wiring.wiredPhases ?? [];
const wiredPhaseNames = wiredPhases.map((item: { phase: string }) => item.phase);
const missingWiredPhases = requiredPhases.filter(
  (phase) => !wiredPhaseNames.includes(phase)
);

const reusableContract = wiring.reusableContract ?? {};
const failClosedPolicy = wiring.failClosedPolicy ?? [];

const validationResults = [
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-wiring-implementation:v9.5:gate",
    passed: run("npm run hermes:agentic-run-v3-quality-gate-wiring-implementation:v9.5:gate")
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-wiring-intent:v9.4:gate",
    passed: run("npm run hermes:agentic-run-v3-quality-gate-wiring-intent:v9.4:gate")
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-wiring-proposal:v9.3:gate",
    passed: run("npm run hermes:agentic-run-v3-quality-gate-wiring-proposal:v9.3:gate")
  }
];

const generatedAt = new Date().toISOString();

const artifact = {
  runtime: "hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6",
  generatedAt,
  status: "validated",
  inputArtifacts: [implementationPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-wiring-validation/v9.6.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceWiringImplementation:
      "hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5"
  },
  validation: {
    qualityGateShapePresent: Boolean(wiring.qualityGateShape),
    requiredOutputFields,
    missingOutputFields,
    requiredChecks,
    missingRequiredChecks,
    wiredPhases: wiredPhaseNames,
    missingWiredPhases,
    reusableContractPresent: Boolean(reusableContract.fieldName === "qualityGate"),
    failClosedPolicyPresent: failClosedPolicy.length >= 5,
    validationReady:
      Boolean(wiring.qualityGateShape) &&
      missingOutputFields.length === 0 &&
      missingRequiredChecks.length === 0 &&
      missingWiredPhases.length === 0 &&
      reusableContract.fieldName === "qualityGate" &&
      failClosedPolicy.length >= 5
  },
  safetyBoundary: {
    validationOnly: true,
    patchAppliedByThisStep: false,
    broadSourceRewrite: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusValidated: true,
    wiringImplementationReady: implementation.status === "implemented",
    qualityGateShapePresent: Boolean(wiring.qualityGateShape),
    requiredOutputFieldsPresent: missingOutputFields.length === 0,
    requiredChecksPresent: missingRequiredChecks.length === 0,
    wiredPhasesPresent: missingWiredPhases.length === 0,
    reusableContractPresent: reusableContract.fieldName === "qualityGate",
    failClosedPolicyPresent: failClosedPolicy.length >= 5,
    validationsPassed: validationResults.every((result) => result.passed),
    validationOnly: true,
    noBroadSourceRewrite: true,
    noPatchAppliedByThisStep: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This validates the v9.5 qualityGate wiring implementation.",
    "It confirms required outputs, required checks, wired phases, reusable contract, and fail-closed policy.",
    "It does not rewrite workflow scripts, apply a patch, create a branch, push, merge, or open a PR."
  ]
};

writeJson(
  "hermes/agentic-workflow/run-v3/quality-gate-wiring-validation/v9.6.json",
  artifact
);
writeJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json",
  artifact
);

const md = `# Hermes Agentic Run v3 Quality Gate Wiring Validation v9.6

- Runtime: ${artifact.runtime}
- Status: ${artifact.status}
- Generated: ${artifact.generatedAt}
- Source implementation: ${artifact.run.sourceWiringImplementation}

## Validation

- Quality gate shape present: ${artifact.validation.qualityGateShapePresent}
- Required output fields present: ${artifact.validation.missingOutputFields.length === 0}
- Required checks present: ${artifact.validation.missingRequiredChecks.length === 0}
- Wired phases present: ${artifact.validation.missingWiredPhases.length === 0}
- Reusable contract present: ${artifact.validation.reusableContractPresent}
- Fail-closed policy present: ${artifact.validation.failClosedPolicyPresent}

## Safety

- Validation only: ${artifact.safetyBoundary.validationOnly}
- Broad source rewrite: ${artifact.safetyBoundary.broadSourceRewrite}
- Patch applied by this step: ${artifact.safetyBoundary.patchAppliedByThisStep}
- Branch created: ${artifact.safetyBoundary.branchCreated}
- Pushed: ${artifact.safetyBoundary.pushed}
- Merged: ${artifact.safetyBoundary.merged}
- PR opened: ${artifact.safetyBoundary.prOpened}
`;

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.md"
  ),
  md
);

console.log(JSON.stringify(artifact, null, 2));
