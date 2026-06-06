import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-lifecycle-v7.8.json"
);

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/pr-lifecycle-v7.8.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-lifecycle-v7.8.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-lifecycle-v7.8.md"
];

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-pr-lifecycle-v7.8"
  },
  {
    id: "status-tracked",
    pass: report.status === "tracked"
  },
  {
    id: "pr-detected",
    pass: report.checks?.prDetected === true
  },
  {
    id: "lifecycle-state-computed",
    pass: report.checks?.lifecycleStateComputed === true
  },
  {
    id: "checks-captured",
    pass: report.checks?.checksCaptured === true
  },
  {
    id: "merge-status-captured",
    pass: report.checks?.mergeStatusCaptured === true
  },
  {
    id: "branch-status-captured",
    pass: report.checks?.branchStatusCaptured === true
  },
  {
    id: "post-merge-branch-status-observed",
    pass: report.checks?.postMergeBranchStatusObserved === true
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
