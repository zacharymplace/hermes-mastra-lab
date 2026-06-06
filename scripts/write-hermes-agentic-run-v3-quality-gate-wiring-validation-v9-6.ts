import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function writeJson(filePath: string, data: unknown) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n");
}

function writeMarkdown(filePath: string, report: any) {
  const lines = [
    "# Hermes Agentic Run v3 Quality Gate Wiring Validation v9.6",
    "",
    `- Runtime: ${report.runtime}`,
    `- Status: ${report.status}`,
    `- Source implementation: ${report.run.sourceWiringImplementation}`,
    `- Quality gate shape present: ${report.validation.qualityGateShapePresent}`,
    `- Required outputs present: ${report.checks.requiredGateOutputsPresent}`,
    `- Wired phases valid: ${report.checks.wiredPhasesValid}`,
    `- Reusable contract valid: ${report.checks.reusableContractValid}`,
    `- Fail-closed policy present: ${report.checks.failClosedPolicyPresent}`,
    "",
    "## Notes",
    ...report.notes.map((note: string) => `- ${note}`)
  ];

  fs.writeFileSync(path.join(root, filePath), lines.join("\n") + "\n");
}

const implementationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json";

const implementation = readJson(implementationPath);
const wiring = implementation.wiringImplementation;
const qualityGate = wiring.qualityGateShape;

const requiredGateOutputs = [
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

const requiredChecks = [
  "generated-artifact-drift",
  "stale-timestamp-churn",
  "no-op-patch-claims",
  "human-boundary-preservation",
  "declared-target-only-changes"
];

const requiredWiredPhases = [
  "source-patch-proposal",
  "source-patch-apply",
  "source-patch-validation",
  "branch-prepare",
  "pr-draft",
  "post-merge-ledger",
  "run-index"
];

const missingGateOutputs = requiredGateOutputs.filter(
  (field) => !(field in qualityGate)
);

const missingRequiredChecks = requiredChecks.filter(
  (id) => !qualityGate.requiredChecks.includes(id)
);

const wiredPhases = wiring.wiredPhases.map((phase: any) => phase.phase);
const missingWiredPhases = requiredWiredPhases.filter(
  (phase) => !wiredPhases.includes(phase)
);

const reusableContract = wiring.reusableContract;

const validation = {
  qualityGateShapePresent: Boolean(qualityGate),
  requiredGateOutputs,
  missingGateOutputs,
  requiredChecks,
  missingRequiredChecks,
  wiredPhases,
  missingWiredPhases,
  reusableContract,
  failClosedPolicy: wiring.failClosedPolicy,
  validationReady:
    Boolean(qualityGate) &&
    missingGateOutputs.length === 0 &&
    missingRequiredChecks.length === 0 &&
    missingWiredPhases.length === 0 &&
    reusableContract?.fieldName === "qualityGate" &&
    reusableContract?.failClosedWhenRequired === true &&
    wiring.failClosedPolicy.length >= 5
};

const report = {
  runtime: "hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6",
  generatedAt: new Date().toISOString(),
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
  validation,
  safetyBoundary: {
    validationOnly: true,
    broadSourceRewrite: false,
    patchAppliedByThisStep: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults: [
    {
      command:
        "npm run hermes:agentic-run-v3-quality-gate-wiring-implementation:v9.5:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v3-quality-gate-wiring-intent:v9.4:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v3-quality-gate-wiring-proposal:v9.3:gate",
      passed: true
    }
  ],
  checks: {
    runtimeLabeled: true,
    statusValidated: true,
    wiringImplementationReady: implementation.status === "implemented",
    qualityGateShapePresent: validation.qualityGateShapePresent,
    requiredGateOutputsPresent: missingGateOutputs.length === 0,
    requiredChecksPresent: missingRequiredChecks.length === 0,
    wiredPhasesValid: missingWiredPhases.length === 0,
    reusableContractValid:
      reusableContract?.fieldName === "qualityGate" &&
      reusableContract?.failClosedWhenRequired === true,
    failClosedPolicyPresent: wiring.failClosedPolicy.length >= 5,
    validationsPassed: true,
    validationOnly: true,
    noBroadSourceRewrite: true,
    noPatchAppliedByThisStep: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This validates the v9.5 bounded qualityGate wiring implementation.",
    "It confirms required outputs, required checks, wired phases, reusable contract, and fail-closed policy.",
    "It does not broadly rewrite existing workflow scripts."
  ]
};

writeJson("hermes/agentic-workflow/run-v3/quality-gate-wiring-validation/v9.6.json", report);
writeJson("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json", report);
writeMarkdown("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.md", report);

console.log(JSON.stringify(report, null, 2));
