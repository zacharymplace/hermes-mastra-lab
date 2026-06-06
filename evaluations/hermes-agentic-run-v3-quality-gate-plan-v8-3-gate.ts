import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-plan/v8.3.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.md"
];

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.json"
    ),
    "utf8"
  )
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v3-quality-gate-plan-v8.3"
  },
  {
    id: "status-planned",
    pass: report.status === "planned"
  },
  {
    id: "contract-valid",
    pass: report.checks?.contractValid === true
  },
  {
    id: "selected-loop-quality",
    pass: report.checks?.selectedLoopQuality === true
  },
  {
    id: "gates-planned",
    pass: Array.isArray(report.plan?.gates) && report.plan.gates.length >= 5
  },
  {
    id: "generated-artifact-drift-planned",
    pass: report.checks?.generatedArtifactDriftPlanned === true
  },
  {
    id: "timestamp-churn-planned",
    pass: report.checks?.timestampChurnPlanned === true
  },
  {
    id: "no-op-patch-claims-planned",
    pass: report.checks?.noOpPatchClaimsPlanned === true
  },
  {
    id: "human-boundary-planned",
    pass: report.checks?.humanBoundaryPlanned === true
  },
  {
    id: "declared-target-only-changes-planned",
    pass: report.checks?.declaredTargetOnlyChangesPlanned === true
  },
  {
    id: "planning-only",
    pass: report.checks?.planningOnly === true
  },
  {
    id: "no-patch-generated",
    pass: report.checks?.noPatchGenerated === true
  },
  {
    id: "no-patch-applied",
    pass: report.checks?.noPatchApplied === true
  },
  {
    id: "no-branch-created",
    pass: report.checks?.noBranchCreated === true
  },
  {
    id: "no-push",
    pass: report.checks?.noPush === true
  },
  {
    id: "no-merge",
    pass: report.checks?.noMerge === true
  },
  {
    id: "no-pr-opened",
    pass: report.checks?.noPrOpened === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) =>
      fs.existsSync(path.join(root, artifact))
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
