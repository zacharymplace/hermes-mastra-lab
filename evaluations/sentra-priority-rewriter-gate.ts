import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const proposal = JSON.parse(
  fs.readFileSync(
    path.join(root, "sentra/priorities/proposals/current.json"),
    "utf8"
  )
);

const applyReport = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/priorities/sentra-priority-apply.json"),
    "utf8"
  )
);

const rewrittenPriorities = JSON.parse(
  fs.readFileSync(path.join(root, "sentra/priorities/current.json"), "utf8")
);

const checks = [
  {
    id: "proposal-runtime-labeled",
    pass: proposal.runtime === "sentra-priority-rewriter-v1"
  },
  {
    id: "proposal-pending-approval",
    pass: proposal.status === "pending-approval"
  },
  {
    id: "proposal-from-weekly-review",
    pass: proposal.sourceArtifact === "sentra/reviews/weekly/current.json"
  },
  {
    id: "proposed-priorities-present",
    pass: Array.isArray(proposal.proposedPriorities)
  },
  {
    id: "apply-runtime-labeled",
    pass: applyReport.runtime === "sentra-priority-apply-v1"
  },
  {
    id: "approval-captured",
    pass:
      applyReport.checks?.approvalGranted === true &&
      applyReport.checks?.reviewerCaptured === true &&
      applyReport.checks?.reasonCaptured === true
  },
  {
    id: "priorities-applied",
    pass: applyReport.checks?.prioritiesApplied === true
  },
  {
    id: "target-rewritten",
    pass:
      Array.isArray(rewrittenPriorities) &&
      rewrittenPriorities[0]?.id === proposal.proposedPriorities[0]?.id
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
