import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-implementation/v8.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.md"
];

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json"
    ),
    "utf8"
  )
);

const checks = [
  {
    id: "runtime-labeled",
    pass:
      report.runtime ===
      "hermes-agentic-run-v3-quality-gate-implementation-v8.5"
  },
  {
    id: "status-implemented",
    pass: report.status === "implemented"
  },
  {
    id: "intent-valid",
    pass: report.checks?.intentValid === true
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
    id: "generated-artifact-drift-implemented",
    pass: report.checks?.generatedArtifactDriftImplemented === true
  },
  {
    id: "timestamp-churn-implemented",
    pass: report.checks?.timestampChurnImplemented === true
  },
  {
    id: "no-op-patch-claims-implemented",
    pass: report.checks?.noOpPatchClaimsImplemented === true
  },
  {
    id: "human-boundary-implemented",
    pass: report.checks?.humanBoundaryImplemented === true
  },
  {
    id: "declared-target-only-changes-implemented",
    pass: report.checks?.declaredTargetOnlyChangesImplemented === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "implementation-only",
    pass: report.checks?.implementationOnly === true
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
    id: "declared-targets-clean",
    pass: report.checks?.declaredTargetsClean === true
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
