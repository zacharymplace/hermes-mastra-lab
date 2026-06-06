import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath = path.join(root, "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-branch-prepare-v7.7.json");

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/branch-prep/v7.7.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-branch-prepare-v7.7.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-branch-prepare-v7.7.md"
];

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-branch-prepare-v7.7"
  },
  {
    id: "ready-for-human-review",
    pass: report.status === "ready-for-human-review"
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
    id: "reason-captured",
    pass: report.checks?.reasonCaptured === true
  },
  {
    id: "source-pr-draft-ready",
    pass: report.checks?.sourcePrDraftReady === true
  },
  {
    id: "branch-prepared",
    pass: report.checks?.branchPrepared === true
  },
  {
    id: "branch-name-matches",
    pass: report.checks?.branchNameMatches === true
  },
  {
    id: "local-branch-only",
    pass: report.checks?.localBranchOnly === true
  },
  {
    id: "not-pushed",
    pass: report.checks?.notPushed === true
  },
  {
    id: "pr-not-opened",
    pass: report.checks?.prNotOpened === true
  },
  {
    id: "no-merge",
    pass: report.checks?.noMerge === true
  },
  {
    id: "human-operator-required",
    pass: report.checks?.humanOperatorRequiredForPushAndPr === true
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
