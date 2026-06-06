import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-implementation-intent/v8.4.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.md"
];

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json"
    ),
    "utf8"
  )
);

const checks = [
  {
    id: "runtime-labeled",
    pass:
      report.runtime ===
      "hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4"
  },
  {
    id: "status-intent-declared",
    pass: report.status === "intent-declared"
  },
  {
    id: "plan-valid",
    pass: report.checks?.planValid === true
  },
  {
    id: "selected-loop-quality",
    pass: report.checks?.selectedLoopQuality === true
  },
  {
    id: "implementation-intent-present",
    pass: report.checks?.implementationIntentPresent === true
  },
  {
    id: "proposed-patch-shape-declared",
    pass: report.checks?.proposedPatchShapeDeclared === true
  },
  {
    id: "planned-checks-carried-forward",
    pass: report.checks?.plannedChecksCarriedForward === true
  },
  {
    id: "implementation-rules-declared",
    pass: report.checks?.implementationRulesDeclared === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "intent-only",
    pass: report.checks?.intentOnly === true
  },
  {
    id: "no-implementation-generated",
    pass: report.checks?.noImplementationGenerated === true
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
