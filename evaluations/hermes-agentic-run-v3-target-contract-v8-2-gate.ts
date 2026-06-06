import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/target-contract/v8.2.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v3-target-contract-v8.2"
  },
  {
    id: "status-contracted",
    pass: report.status === "contracted"
  },
  {
    id: "selector-chose-loop-quality",
    pass: report.checks?.selectorChoseLoopQuality === true
  },
  {
    id: "target-declared",
    pass: report.checks?.targetDeclared === true
  },
  {
    id: "quality-gates-declared",
    pass: report.checks?.qualityGatesDeclared === true
  },
  {
    id: "generated-drift-gate-declared",
    pass: report.checks?.generatedDriftGateDeclared === true
  },
  {
    id: "timestamp-churn-gate-declared",
    pass: report.checks?.timestampChurnGateDeclared === true
  },
  {
    id: "no-op-patch-gate-declared",
    pass: report.checks?.noOpPatchGateDeclared === true
  },
  {
    id: "human-boundary-gate-declared",
    pass: report.checks?.humanBoundaryGateDeclared === true
  },
  {
    id: "declared-targets-gate-declared",
    pass: report.checks?.declaredTargetsGateDeclared === true
  },
  {
    id: "allowed-targets-declared",
    pass: report.checks?.allowedTargetsDeclared === true
  },
  {
    id: "disallowed-targets-declared",
    pass: report.checks?.disallowedTargetsDeclared === true
  },
  {
    id: "contract-only",
    pass: report.checks?.contractOnly === true
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
