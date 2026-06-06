import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/applied/hermes-agentic-patch-apply-report.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "reports/agentic-workflow/applied/hermes-agentic-applied-patch.md",
  "reports/agentic-workflow/applied/hermes-agentic-patch-apply-report.json",
  "reports/agentic-workflow/applied/hermes-agentic-patch-apply-report.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-patch-apply-v1"
  },
  {
    id: "status-applied",
    pass: report.status === "applied"
  },
  {
    id: "approval-granted",
    pass: report.checks?.approvalGranted === true
  },
  {
    id: "reviewer-captured",
    pass: report.checks?.reviewerCaptured === true
  },
  {
    id: "source-ready-for-approval",
    pass: report.checks?.sourceReadyForApproval === true
  },
  {
    id: "source-requires-approval",
    pass: report.checks?.sourceRequiresApproval === true
  },
  {
    id: "safe-scope-confirmed",
    pass: report.checks?.safeScopeConfirmed === true
  },
  {
    id: "constrained-targets-only",
    pass: report.checks?.constrainedTargetsOnly === true
  },
  {
    id: "no-auto-merge",
    pass: report.checks?.noAutoMerge === true
  },
  {
    id: "no-push",
    pass: report.checks?.noPush === true
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
