import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/pr-lifecycle/v6.5.json",
  "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json",
  "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-pr-lifecycle-v6.5"
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
    id: "post-merge-branch-status-valid",
    pass: report.checks?.postMergeBranchDeletedOrStillOpen === true
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
