import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const run = (command: string) => {
  try {
    const output = execSync(command, {
      cwd: root,
      stdio: "pipe",
      encoding: "utf8"
    });

    return { command, passed: true, output };
  } catch (error) {
    return {
      command,
      passed: false,
      output: error instanceof Error ? error.message : String(error)
    };
  }
};

const applyPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.json";

const apply = readJson(applyPath);

const outputArtifacts = [
  "hermes/agentic-workflow/run-v4/source-patch-validation/v10.2.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2.md"
];

const qualityGate = apply.qualityGate;

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

const missingGateOutputs = requiredGateOutputs.filter(
  (key) => !(key in qualityGate)
);

const requiredApplyFields = ["applied", "changed", "diffOutput", "semanticChange"];

const missingApplyFields = requiredApplyFields.filter(
  (key) => !(key in apply.sourcePatchApply)
);

const qualityGatePassed = qualityGate.passed === true;
const applyReady = apply.status === "ready-for-human-review";
const declaredTargetsClean =
  Array.isArray(qualityGate.declaredTargetOnlyChanges?.undeclaredChanges) &&
  qualityGate.declaredTargetOnlyChanges.undeclaredChanges.length === 0;

const validationResults = [
  run("npm run hermes:agentic-run-v4-quality-gated-source-patch-apply:v10.1:gate"),
  run("npm run hermes:agentic-run-v4-quality-gated-source-patch-proposal:v10.0:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-index:v9.7:gate")
];

const validationsPassed = validationResults.every((result) => result.passed);

const validationPassed =
  applyReady &&
  qualityGatePassed &&
  missingGateOutputs.length === 0 &&
  missingApplyFields.length === 0 &&
  declaredTargetsClean &&
  validationsPassed;

const report = {
  runtime: "hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2",
  generatedAt: new Date().toISOString(),
  status: validationPassed ? "validated" : "failed",
  inputArtifacts: [applyPath],
  outputArtifacts,
  run: {
    id: "hermes-agentic-run-v4",
    sourceApply: "hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1",
    selectedTarget: "first-quality-gated-source-patch-validation"
  },
  sourcePatchValidation: {
    id: "run-v4-first-quality-gated-source-patch-validation-v10.2",
    title: "First Quality-Gated Source Patch Validation",
    summary:
      "Validates the v10.1 quality-gated apply artifact and proves qualityGate can gate readiness after apply.",
    applyReady,
    qualityGatePassed,
    missingGateOutputs,
    missingApplyFields,
    declaredTargetsClean,
    validationPassed
  },
  qualityGate: {
    ...qualityGate,
    status: validationPassed ? "validated-after-apply" : "failed-after-apply",
    passed: validationPassed
  },
  safetyBoundary: {
    validationOnly: true,
    patchAppliedByThisStep: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredForGitHubActions: true
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusValidated: validationPassed,
    applyReady,
    qualityGatePresent: Boolean(qualityGate),
    qualityGatePassed,
    requiredGateOutputsPresent: missingGateOutputs.length === 0,
    requiredApplyFieldsPresent: missingApplyFields.length === 0,
    declaredTargetsClean,
    validationsPassed,
    validationOnly: true,
    noPatchAppliedByThisStep: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This validates the first quality-gated source patch apply artifact.",
    "It fails closed if qualityGate is missing, failed, null, or incomplete.",
    "It does not apply a patch, create a branch, push, merge, or open a PR."
  ]
};

for (const out of outputArtifacts.slice(0, 2)) {
  const full = path.join(root, out);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(report, null, 2) + "\n");
}

const md = `# Hermes Agentic Run v4 Quality-Gated Source Patch Validation v10.2

Status: ${report.status}

## Summary

${report.sourcePatchValidation.summary}

## Validation

- Apply ready: ${report.sourcePatchValidation.applyReady}
- Quality gate passed: ${report.sourcePatchValidation.qualityGatePassed}
- Required gate outputs present: ${report.sourcePatchValidation.missingGateOutputs.length === 0}
- Required apply fields present: ${report.sourcePatchValidation.missingApplyFields.length === 0}
- Declared targets clean: ${report.sourcePatchValidation.declaredTargetsClean}
- Validation passed: ${report.sourcePatchValidation.validationPassed}

## Safety

- Validation only.
- No patch applied by this step.
- No branch created.
- No push.
- No merge.
- No PR opened.
`;

fs.writeFileSync(path.join(root, outputArtifacts[2]), md);

console.log(JSON.stringify(report, null, 2));

if (!validationPassed) {
  process.exit(1);
}
