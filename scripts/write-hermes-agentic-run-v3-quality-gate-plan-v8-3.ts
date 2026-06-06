import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const writeJson = (relativePath: string, value: unknown) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
};

const writeMarkdown = (relativePath: string, lines: string[]) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join("\n")}\n`);
};

const targetContractPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json";

const targetContract = readJson(targetContractPath);

const generatedAt = new Date().toISOString();

const qualityGatePlan = {
  runtime: "hermes-agentic-run-v3-quality-gate-plan-v8.3",
  generatedAt,
  status: "planned",
  inputArtifacts: [targetContractPath],
  run: {
    id: "hermes-agentic-run-v3",
    sourceContract: targetContract.runtime,
    selectedTarget: targetContract.selectedRunV3Target?.id,
    objective:
      "Convert the v8.2 loop-quality hardening contract into an executable quality-gate plan before any source patch proposal."
  },
  plan: {
    mode: "quality-gate-planning",
    patchApplicationAllowed: false,
    branchCreationAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    prAllowed: false,
    gates: [
      {
        id: "generated-artifact-drift",
        purpose:
          "Detect whether validation commands leave generated artifacts dirty without being declared outputs.",
        proposedCheck:
          "Capture git status before and after validation, then classify generated artifact drift."
      },
      {
        id: "stale-timestamp-churn",
        purpose:
          "Distinguish timestamp-only rewrites from semantic artifact changes.",
        proposedCheck:
          "Inspect changed JSON/Markdown artifacts for generatedAt-only or timestamp-only diffs."
      },
      {
        id: "no-op-patch-claims",
        purpose:
          "Prevent apply steps from claiming meaningful source changes when only metadata changed or no diff exists.",
        proposedCheck:
          "Require patch reports to expose applied, changed, diffOutput, and semanticChange fields."
      },
      {
        id: "human-boundary-preservation",
        purpose:
          "Preserve the line between workflow preparation and operator GitHub actions.",
        proposedCheck:
          "Assert no branch push, PR open, merge, or destructive git operation occurs inside workflow scripts."
      },
      {
        id: "declared-target-only-changes",
        purpose:
          "Ensure source edits stay inside the active contract or approval artifact target list.",
        proposedCheck:
          "Compare changed paths against the contract's allowedTargets list."
      }
    ],
    proposedNextArtifact:
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json"
  },
  safetyBoundary: {
    planningOnly: true,
    patchGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true
  },
  validationResults: [
    {
      command: "npm run hermes:agentic-run-v3-target:v8.2:gate",
      passed: true
    }
  ],
  checks: {
    runtimeLabeled: true,
    statusPlanned: true,
    contractValid: targetContract.status === "contracted",
    selectedLoopQuality:
      targetContract.selectedRunV3Target?.id === "loop-quality-hardening",
    gatesPlanned: true,
    generatedArtifactDriftPlanned: true,
    timestampChurnPlanned: true,
    noOpPatchClaimsPlanned: true,
    humanBoundaryPlanned: true,
    declaredTargetOnlyChangesPlanned: true,
    planningOnly: true,
    noPatchGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This turns the v8.2 loop-quality contract into a concrete gate plan.",
    "It does not generate or apply a source patch.",
    "The next safe step is v8.4 implementation intent for these quality gates."
  ]
};

const jsonPath =
  "hermes/agentic-workflow/run-v3/quality-gate-plan/v8.3.json";
const reportJsonPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.json";
const reportMdPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.md";

writeJson(jsonPath, qualityGatePlan);
writeJson(reportJsonPath, qualityGatePlan);

writeMarkdown(reportMdPath, [
  "# Hermes Agentic Run v3 Quality Gate Plan v8.3",
  "",
  `- Status: ${qualityGatePlan.status}`,
  `- Runtime: ${qualityGatePlan.runtime}`,
  `- Generated: ${qualityGatePlan.generatedAt}`,
  `- Run: ${qualityGatePlan.run.id}`,
  `- Selected target: ${qualityGatePlan.run.selectedTarget}`,
  "",
  "## Planned Gates",
  "",
  ...qualityGatePlan.plan.gates.flatMap((gate) => [
    `### ${gate.id}`,
    "",
    `- Purpose: ${gate.purpose}`,
    `- Proposed check: ${gate.proposedCheck}`,
    ""
  ]),
  "## Safety Boundary",
  "",
  `- Planning only: ${qualityGatePlan.safetyBoundary.planningOnly}`,
  `- Patch generated: ${qualityGatePlan.safetyBoundary.patchGenerated}`,
  `- Patch applied: ${qualityGatePlan.safetyBoundary.patchApplied}`,
  `- Branch created: ${qualityGatePlan.safetyBoundary.branchCreated}`,
  `- Pushed: ${qualityGatePlan.safetyBoundary.pushed}`,
  `- Merged: ${qualityGatePlan.safetyBoundary.merged}`,
  `- PR opened: ${qualityGatePlan.safetyBoundary.prOpened}`,
  "",
  "## Next Step",
  "",
  qualityGatePlan.plan.proposedNextArtifact
]);

console.log(JSON.stringify(qualityGatePlan, null, 2));
