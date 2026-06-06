import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/pr-drafts/v4.json",
  "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4.json",
  "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4.md",
  "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.json",
  "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-pr-draft-v4-report"
  },
  {
    id: "ready-for-human-review",
    pass: report.status === "ready-for-human-review"
  },
  {
    id: "source-patch-apply-ready",
    pass: report.checks?.sourcePatchApplyReady === true
  },
  {
    id: "selected-project-present",
    pass: report.checks?.selectedProjectPresent === true
  },
  {
    id: "draft-written",
    pass: report.checks?.draftWritten === true
  },
  {
    id: "body-written",
    pass: report.checks?.bodyWritten === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "branch-not-created",
    pass: report.checks?.branchNotCreated === true
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
    id: "no-auto-merge",
    pass: report.checks?.noAutoMerge === true
  },
  {
    id: "human-approval-required",
    pass: report.checks?.humanApprovalRequired === true
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
