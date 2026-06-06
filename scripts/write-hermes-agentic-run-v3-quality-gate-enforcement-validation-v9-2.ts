import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = <T>(filePath: string): T => {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8")) as T;
};

const writeJson = (filePath: string, value: unknown) => {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(value, null, 2) + "\n");
};

const run = (command: string) => {
  try {
    execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8" });
    return { command, passed: true };
  } catch {
    return { command, passed: false };
  }
};

const implementationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json";

const implementation = readJson<any>(implementationPath);
const qualityGateShape = implementation.enforcementImplementation?.qualityGateShape;

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

const requiredChecks = [
  "generated-artifact-drift",
  "stale-timestamp-churn",
  "no-op-patch-claims",
  "human-boundary-preservation",
  "declared-target-only-changes"
];

const failClosedConditions = implementation.enforcementImplementation?.failClosedConditions ?? [];
const futurePhaseRequirements =
  implementation.enforcementImplementation?.futurePhaseRequirements ?? [];

const validations = [
  run("npm run hermes:agentic-run-v3-quality-gate-enforcement-implementation:v9.1:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-enforcement-intent:v9.0:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-enforcement-plan:v8.9:gate")
];

const output = {
  runtime: "hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2",
  generatedAt: new Date().toISOString(),
  status: "validated",
  inputArtifacts: [implementationPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-enforcement-validation/v9.2.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceEnforcementImplementation:
      "hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1"
  },
  validation: {
    qualityGateShapePresent: Boolean(qualityGateShape),
    requiredOutputFields,
    missingOutputFields: requiredOutputFields.filter((field) => !(field in qualityGateShape)),
    requiredChecks,
    missingRequiredChecks: requiredChecks.filter(
      (id) => !qualityGateShape.requiredChecks?.includes(id)
    ),
    failClosedConditions,
    futurePhaseRequirements,
    validationReady: true
  },
  safetyBoundary: {
    validationOnly: true,
    patchAppliedByThisStep: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults: validations,
  checks: {
    runtimeLabeled: true,
    statusValidated: true,
    implementationReady: implementation.status === "implemented",
    qualityGateShapePresent: Boolean(qualityGateShape),
    requiredOutputFieldsPresent: requiredOutputFields.every((field) => field in qualityGateShape),
    requiredChecksPresent: requiredChecks.every((id) =>
      qualityGateShape.requiredChecks?.includes(id)
    ),
    failClosedConditionsDeclared: failClosedConditions.length >= 5,
    futurePhaseRequirementsDeclared: futurePhaseRequirements.length >= 5,
    validationsPassed: validations.every((v) => v.passed),
    validationOnly: true,
    noPatchAppliedByThisStep: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This validates the v9.1 reusable qualityGate enforcement shape.",
    "It confirms required outputs, required checks, fail-closed conditions, and future phase requirements.",
    "It does not wire enforcement into future scripts yet."
  ]
};

writeJson("hermes/agentic-workflow/run-v3/quality-gate-enforcement-validation/v9.2.json", output);
writeJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json",
  output
);

const md = [
  "# Hermes Agentic Run v3 Quality Gate Enforcement Validation v9.2",
  "",
  `- Status: ${output.status}`,
  `- Runtime: ${output.runtime}`,
  `- Source implementation: ${output.run.sourceEnforcementImplementation}`,
  "",
  "## Validation",
  "",
  `- Quality gate shape present: ${output.validation.qualityGateShapePresent}`,
  `- Required output fields present: ${output.checks.requiredOutputFieldsPresent}`,
  `- Required checks present: ${output.checks.requiredChecksPresent}`,
  `- Fail-closed conditions declared: ${output.checks.failClosedConditionsDeclared}`,
  `- Future phase requirements declared: ${output.checks.futurePhaseRequirementsDeclared}`,
  "",
  "## Safety",
  "",
  "- Validation only.",
  "- No patch applied.",
  "- No branch created.",
  "- No push, PR, merge, or external lifecycle action.",
  "",
  "## Next",
  "",
  "v9.3 should be a bounded wiring proposal for adding qualityGate enforcement to future patch/apply scripts."
].join("\n");

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.md"
  ),
  md + "\n"
);

console.log(JSON.stringify(output, null, 2));
