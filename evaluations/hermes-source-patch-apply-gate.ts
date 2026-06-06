import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/source-patches/applied/hermes-source-patch-apply-report.json"
    ),
    "utf8"
  )
);

const doc = fs.readFileSync(
  path.join(root, "docs/hermes-agentic-workflow.md"),
  "utf8"
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-source-patch-apply-v1"
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
    id: "proposal-status-valid",
    pass: report.checks?.proposalStatusValid === true
  },
  {
    id: "approved-targets-only",
    pass: report.checks?.approvedTargetsOnly === true
  },
  {
    id: "rollback-notes-present",
    pass: report.checks?.rollbackNotesPresent === true
  },
  {
    id: "source-patch-applied",
    pass: report.checks?.sourcePatchApplied === true
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
    id: "doc-updated",
    pass: doc.includes("## Source Patch Apply v1")
  },
  {
    id: "report-md-written",
    pass: fs.existsSync(
      path.join(
        root,
        "reports/agentic-workflow/source-patches/applied/hermes-source-patch-apply-report.md"
      )
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
